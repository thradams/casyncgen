#include "stdafx.h"
#include "Actor.h"

#include "actor.h"


#include <stdlib.h>
#include "async.h"
#include <assert.h>

#define ASSERT(x)


Result Actor_Init(Actor* actor)
{
  actor->state = ACTOR_STATE_NONE;
  actor->tasks_size = 0;
  actor->taks_max_size = 100;
  actor->current_tasks = 0;
  int r = mtx_init(&actor->s_queue_mutex, mtx_plain);
  return r == thrd_success ? RESULT_OK : RESULT_FAIL;
}

void Actor_Destroy(Actor* actor)
{
  mtx_destroy(&actor->s_queue_mutex);
}

static int Actor_GetMessages(Actor* actor,
                              ActorTask** current_tasks)
{
  *current_tasks = NULL; //out

  int tasks = 0;
  mtx_lock(&actor->s_queue_mutex);
  tasks = actor->tasks_size;

  if (tasks != 0)
  {
    actor->state = ACTOR_STATE_RUNNING;
    *current_tasks = actor->current_tasks;
    actor->current_tasks = NULL;
    actor->tasks_size = 0;
  }
  else
  {
    actor->state = ACTOR_STATE_NONE;
  }

  mtx_unlock(&actor->s_queue_mutex);
  return tasks;
}


static void ActorProcessMessages(Result result, void* p)
{
  Actor* actor = (Actor*)(p);

  for (;;)
  {
    ActorTask* current_tasks;
    int tasks = Actor_GetMessages(actor, &current_tasks);

    if (tasks == 0)
    {
      break;
    }

    //for (int i = tasks - 1; i >= 0; i--)
    for (int i = 0; i < tasks; i++)
    {
      ActorTask* pTask = &current_tasks[i];
      pTask->Callback(RESULT_OK,
                      actor,
                      pTask->Data);
    }
  }
}

void Actor_Post(Actor* actor,
  void(*callback)(Result, struct Actor_t*, void*),
  void* data)
{
  int result = 0;
  mtx_lock(&actor->s_queue_mutex);

  if (actor->current_tasks == 0)
  {
    actor->current_tasks =
      (ActorTask*)malloc(sizeof(ActorTask) * actor->taks_max_size);

    if (actor->current_tasks == 0)
    {
      callback(RESULT_OUTOFMEM, actor, data);      
      result = 1;
    }
  }

  if (result == 0)
  {
    actor->current_tasks[actor->tasks_size].Callback = callback;
    actor->current_tasks[actor->tasks_size].Data = data;
    actor->tasks_size++;

    switch (actor->state)
    {
    case ACTOR_STATE_NONE:
      actor->state = ACTOR_STATE_ONQUEUE;
      AsynPool_Run(&ActorProcessMessages, actor);
      break;

    case ACTOR_STATE_ONQUEUE:
    case ACTOR_STATE_RUNNING:
      break;

    default:
      ASSERT(false);
    }
  }

  mtx_unlock(&actor->s_queue_mutex);
}

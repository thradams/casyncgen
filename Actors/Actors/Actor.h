#pragma once

#pragma once
#include "tinycthread.h"
#include "Result.h"
typedef enum 
{
  ACTOR_STATE_NONE,
  ACTOR_STATE_RUNNING,
  ACTOR_STATE_ONQUEUE
} ACTOR_STATE;


typedef struct  
{
  void(*Callback)(Result, struct Actor_t*, void*);
  void* Data;  
} ActorTask;

typedef struct Actor_t
{
  ACTOR_STATE state;
  mtx_t s_queue_mutex;

  ActorTask* current_tasks;
  int tasks_size;
  int taks_max_size;
} Actor;


Result  Actor_Init(Actor* actor);
void Actor_Destroy(Actor* actor);

void Actor_Post(Actor* actor,
  void(*callback)(Result, struct Actor_t*, void*),
  void* data);

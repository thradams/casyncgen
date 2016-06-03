#include "stdafx.h"

#include "Async.h"
#include "async.h"
#include "async.h"
#include "tinycthread.h"
#include <stdbool.h>

#define ASSERT(x)

//Number of threads
#define ASYNC_POOL_N_THREADS 2

//Maximum number of unprocessed tasks that queue can keep
#define MAX_TASKS 100

typedef struct
{
  void (*Callback)(Result, void*);
  void* Data;
} Task;

typedef struct
{
  Task   Buffer[MAX_TASKS];
  size_t Count;
  Task*  pHeadTask;
  Task*  pTailTask;
} TaskQueue;

//Static task queue with its mutex
static mtx_t  s_TaskQueueMutex;
static TaskQueue s_TaskQueue;

//Pool threads
static thrd_t  s_AsyncPoolThreads[ASYNC_POOL_N_THREADS];

//Flag used to stop the pool
static bool    s_AsyncPoolStopFlag = false;

//Condition to wakeup
static cnd_t   s_Condition;


static void TaskQueue_Init(TaskQueue* q)
{
  q->Count = 0;
  q->pHeadTask = q->Buffer;
  q->pTailTask = q->Buffer;
}

static Result TaskQueue_Push(TaskQueue* q,
                             void (callback)(Result, void*),
                             void* data)
{
  int result = RESULT_OVERFLOW;
  if (q->Count < MAX_TASKS)
  {
    q->pHeadTask->Callback = callback;
    q->pHeadTask->Data = data;

    q->pHeadTask++;

    if (q->pHeadTask == (q->Buffer + MAX_TASKS))
    {
      q->pHeadTask = q->Buffer;
    }
    q->Count++;
    result = RESULT_OK;
  }

  ASSERT(false);
  return result;
}

static Task* TaskQueue_Pop(TaskQueue* q)
{
  Task* task = NULL;
  if (q->Count >= 0)
  {
    task = q->pTailTask;
    q->pTailTask++;
    if (q->pTailTask == (q->Buffer + MAX_TASKS))
    {
      q->pTailTask = q->Buffer;
    }
    q->Count--;
  }
  return task;
}

static void TaskQueue_Clear(TaskQueue* q)
{
  while (s_TaskQueue.Count > 0)
  {
    Task* p = TaskQueue_Pop(q);
    p->Callback(RESULT_CANCEL, p->Data);
  }
}

static int AsyncPool_Loop(void* pData)
{
  for (;;)
  {
    mtx_lock(&s_TaskQueueMutex);

    while (!s_AsyncPoolStopFlag &&
           s_TaskQueue.Count == 0)
    {
      cnd_wait(&s_Condition, &s_TaskQueueMutex);
    }

    if (s_AsyncPoolStopFlag &&
        s_TaskQueue.Count == 0)
    {
      mtx_unlock(&s_TaskQueueMutex);
      break;
    }
    else
    {
      Task* p = TaskQueue_Pop(&s_TaskQueue);
      mtx_unlock(&s_TaskQueueMutex);
      (*p->Callback)(RESULT_OK, p->Data);
    }
  }
  return 0;
}

Result AsynPool_Init()
{
  TaskQueue_Init(&s_TaskQueue);

  int iResult = mtx_init(&s_TaskQueueMutex, mtx_plain);
  if (iResult == thrd_success)
  {
    iResult = cnd_init(&s_Condition);
    if (iResult == thrd_success)
    {
      for (int i = 0; i < ASYNC_POOL_N_THREADS; i++)
      {
        iResult = thrd_create(&s_AsyncPoolThreads[i], &AsyncPool_Loop, 0);
        if (iResult != thrd_success)
        {
          break;
        }
      }
    }
  }
  return iResult == thrd_success ? RESULT_OK : RESULT_FAIL;
}

void AsynPool_Run(void(*callback)(Result, void*),
                  void* data)
{
  Result result;

  mtx_lock(&s_TaskQueueMutex);
  result = TaskQueue_Push(&s_TaskQueue, callback, data);
  mtx_unlock(&s_TaskQueueMutex);

  if (result == RESULT_OK)
  {
    cnd_broadcast(&s_Condition);
  }
  else
  {
    callback(result, data);
  }  
}

void AsynPool_Join()
{
  bool bWasStopped = false;
  mtx_lock(&s_TaskQueueMutex);
  bWasStopped = s_AsyncPoolStopFlag;
  s_AsyncPoolStopFlag = TRUE;
  mtx_unlock(&s_TaskQueueMutex);

  if (bWasStopped)
  {
    return;
  }

  cnd_broadcast(&s_Condition);

  //Join all threads
  for (size_t i = 0; i < ASYNC_POOL_N_THREADS; ++i)
  {
    int res;
    int r = thrd_join(s_AsyncPoolThreads[i], &res);
    ASSERT(r == thrd_success);
  }

  mtx_lock(&s_TaskQueueMutex);
  TaskQueue_Clear(&s_TaskQueue);
  mtx_unlock(&s_TaskQueueMutex);
}

// Actors.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include "async.h"
#include "tinycthread.h"
#include <assert.h>
#include <stdlib.h>
#include "actor.h"
#include <stdio.h>
#include "Async.h"

void Default(Result result, void* p)
{
}

typedef struct
{
  Actor actor;
  int i;  
} MyServer;

void MyServer_Init(MyServer* p)
{
  Actor_Init(&p->actor);
  p->i = 5;
}

void MyServer_Print(MyServer* pServer)
{
  printf("print1 : %d\n", pServer->i);
}


void SendAsync(const char* str,
               void(*onResult)(Result, void*),
               void* data);


void MyServer_Print2(MyServer* pServer,
                     const char* name)
{
  SendAsync("teste", Default, 0);
}


#ifdef _

async SendAsync(const char* str)->void
{
    async[const char* str] AsynPool_Run() -> void
    {
        printf("chega em outro lugar %s\n", str);
    }
}

async MyServer_Post_Print(MyServer* pServer)->void
{
    async[]
    Actor_Post(&pServer->actor) -> Actor* pActor
    {
      MyServer *pServer = (MyServer *)pActor;
      MyServer_Print(pServer);
    }
}

async MyServer_Post_Print2(MyServer* pServer,
                          const char* name, 
                          const char* httpresponse, int i)->void
{
  async[const char* name, const char* httpresponse, int i]
    Actor_Post(&pServer->actor) -> Actor* pActor
  {
    MyServer *pServer = (MyServer *)pActor;
    MyServer_Print2(pServer, name);
   // async [const char* httpresponse] AsynPool_Run() -> void
    //{
      //printf("chega em outro lugar %s\n", httpresponse);
    //}    
  }
}

#endif
#include "Actors_g_.cpp"

int _tmain(int argc, _TCHAR* argv[])
{
  AsynPool_Init();

  MyServer server;
  MyServer_Init(&server);

  MyServer_Post_Print(&server, &Default, 0);
  MyServer_Post_Print2(&server, "name2", "ht///tpresponse", 3, &Default, 0);

  AsynPool_Join();

  return 0;
}



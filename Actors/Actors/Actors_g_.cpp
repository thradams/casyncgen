typedef struct 
{
    const char* str;
    void (*onResult)(Result, void*);
    void* data;
} AsynPool_Run_Capture196;

static Result AsynPool_Run_Capture196_Init(AsynPool_Run_Capture196** pp,
                                           const char* str,
                                           void (*onResult)(Result, void*),
                                           void* data)
{
    Result result;
    AsynPool_Run_Capture196 *p = (AsynPool_Run_Capture196*)malloc(sizeof(AsynPool_Run_Capture196));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->str = _strdup(str);
        p->onResult = onResult;
        p->data = data;
        *pp = p;
    }
    return result;
}

static void AsynPool_Run_Capture196_Destroy(AsynPool_Run_Capture196* p)
{
    free((void*)p->str);
}

static void AsynPool_Run_Lambda196(Result result, void* _data)
{
    //capture vars
    const char* str = ((AsynPool_Run_Capture196*) _data)->str;
    void (*onResult)(Result, void*) = ((AsynPool_Run_Capture196*) _data)->onResult;
    void* data = ((AsynPool_Run_Capture196*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
//USER CODE====================
        
//USER CODE====================
//USER CODE====================
        printf("chega em outro lugar %s\n", str);
        
//USER CODE====================
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    AsynPool_Run_Capture196_Destroy((AsynPool_Run_Capture196*)_data);
} //lambda




void SendAsync(const char* str,
                 void (*onResult)(Result, void*),
                 void* data)
{
    Result result;
//USER CODE====================
    
//USER CODE====================

    AsynPool_Run_Capture196* _cap;
    result = AsynPool_Run_Capture196_Init(&_cap, str, onResult, data);
    if (result == RESULT_OK)
    {
        AsynPool_Run( AsynPool_Run_Lambda196, _cap);
//USER CODE====================
    
//USER CODE====================
    }
    else
    {
        onResult(result, data);//target error call
    }
}
typedef struct 
{
    void (*onResult)(Result, void*);
    void* data;
} Actor_Post_Capture240;

static Result Actor_Post_Capture240_Init(Actor_Post_Capture240** pp,
                                         void (*onResult)(Result, void*),
                                         void* data)
{
    Result result;
    Actor_Post_Capture240 *p = (Actor_Post_Capture240*)malloc(sizeof(Actor_Post_Capture240));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->onResult = onResult;
        p->data = data;
        *pp = p;
    }
    return result;
}

static void Actor_Post_Capture240_Destroy(Actor_Post_Capture240* p)
{
}

static void Actor_Post_Lambda240(Result result, Actor* pActor, void* _data)
{
    //capture vars
    void (*onResult)(Result, void*) = ((Actor_Post_Capture240*) _data)->onResult;
    void* data = ((Actor_Post_Capture240*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
//USER CODE====================
        
//USER CODE====================
//USER CODE====================
        MyServer *pServer = (MyServer *)pActor;
        MyServer_Print(pServer);
        
//USER CODE====================
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    Actor_Post_Capture240_Destroy((Actor_Post_Capture240*)_data);
} //lambda




void MyServer_Post_Print(MyServer* pServer,
                           void (*onResult)(Result, void*),
                           void* data)
{
    Result result;
//USER CODE====================
    
//USER CODE====================

    Actor_Post_Capture240* _cap;
    result = Actor_Post_Capture240_Init(&_cap, onResult, data);
    if (result == RESULT_OK)
    {
        Actor_Post( &pServer->actor, Actor_Post_Lambda240, _cap);
//USER CODE====================
    
//USER CODE====================
    }
    else
    {
        onResult(result, data);//target error call
    }
}
typedef struct 
{
    const char* name;
    const char* httpresponse;
    void (*onResult)(Result, void*);
    void* data;
} Actor_Post_Capture242;

static Result Actor_Post_Capture242_Init(Actor_Post_Capture242** pp,
                                         const char* name,
                                         const char* httpresponse,
                                         void (*onResult)(Result, void*),
                                         void* data)
{
    Result result;
    Actor_Post_Capture242 *p = (Actor_Post_Capture242*)malloc(sizeof(Actor_Post_Capture242));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->name = _strdup(name);
        p->httpresponse = _strdup(httpresponse);
        p->onResult = onResult;
        p->data = data;
        *pp = p;
    }
    return result;
}

static void Actor_Post_Capture242_Destroy(Actor_Post_Capture242* p)
{
    free((void*)p->name);
    free((void*)p->httpresponse);
}

static void Actor_Post_Lambda242(Result result, Actor* pActor, void* _data)
{
    //capture vars
    const char* name = ((Actor_Post_Capture242*) _data)->name;
    const char* httpresponse = ((Actor_Post_Capture242*) _data)->httpresponse;
    void (*onResult)(Result, void*) = ((Actor_Post_Capture242*) _data)->onResult;
    void* data = ((Actor_Post_Capture242*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
//USER CODE====================
        
//USER CODE====================
//USER CODE====================
        MyServer *pServer = (MyServer *)pActor->object;
        MyServer_Print2(pServer, name);
        // async [const char* httpresponse] AsynPool_Run() -> void
        //{
        //printf("chega em outro lugar %s\n", httpresponse);
        //}
        
//USER CODE====================
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    Actor_Post_Capture242_Destroy((Actor_Post_Capture242*)_data);
} //lambda




void MyServer_Post_Print2(MyServer* pServer,
                            const char* name,
                            const char* httpresponse,
                            void (*onResult)(Result, void*),
                            void* data)
{
    Result result;
//USER CODE====================
    
//USER CODE====================

    Actor_Post_Capture242* _cap;
    result = Actor_Post_Capture242_Init(&_cap, name, httpresponse, onResult, data);
    if (result == RESULT_OK)
    {
        Actor_Post( &pServer->actor, Actor_Post_Lambda242, _cap);
//USER CODE====================
    
//USER CODE====================
    }
    else
    {
        onResult(result, data);//target error call
    }
}

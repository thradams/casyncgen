typedef struct 
{
    const char* str;
    void (*onResult)(Result, void*);
    void* data;
} AsynPool_Run_Capture1;

static Result AsynPool_Run_Capture1_Init(AsynPool_Run_Capture1** pp,
                                         const char* str,
                                         void (*onResult)(Result, void*),
                                         void* data)
{
    Result result;
    AsynPool_Run_Capture1 *p = (AsynPool_Run_Capture1*)malloc(sizeof(AsynPool_Run_Capture1));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->str = _strdup(str);
        result == (p->str != NULL) ? RESULT_OK : RESULT_FAIL;
        if (result == RESULT_OK)
        {
            p->onResult = onResult;
            p->data = data;
            *pp = p;
            goto end;
        }
            free((void*)p->str);
        free((void*)p);
    }
end:
    return result;
}

static void AsynPool_Run_Capture1_Delete(AsynPool_Run_Capture1* p)
{
    free((void*)p->str);
    free((void*)p);
}

static void AsynPool_Run_Lambda1(Result result, void* _data)
{
    //capture vars
    const char* str = ((AsynPool_Run_Capture1*) _data)->str;
    void (*onResult)(Result, void*) = ((AsynPool_Run_Capture1*) _data)->onResult;
    void* data = ((AsynPool_Run_Capture1*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
        
        printf("chega em outro lugar %s\n", str);
        
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    AsynPool_Run_Capture1_Delete((AsynPool_Run_Capture1*)_data);
} //lambda




void SendAsync(const char* str,
                 void (*onResult)(Result, void*),
                 void* data)
{
    Result result;
    

    AsynPool_Run_Capture1* _cap;
    result = AsynPool_Run_Capture1_Init(&_cap, str, onResult, data);
    if (result == RESULT_OK)
    {
        AsynPool_Run( AsynPool_Run_Lambda1, _cap);
    
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
} Actor_Post_Capture3;

static Result Actor_Post_Capture3_Init(Actor_Post_Capture3** pp,
                                       void (*onResult)(Result, void*),
                                       void* data)
{
    Result result;
    Actor_Post_Capture3 *p = (Actor_Post_Capture3*)malloc(sizeof(Actor_Post_Capture3));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->onResult = onResult;
        p->data = data;
        *pp = p;
    }
    return result;
}

static void Actor_Post_Capture3_Delete(Actor_Post_Capture3* p)
{
    free((void*)p);
}

static void Actor_Post_Lambda3(Result result, Actor* pActor, void* _data)
{
    //capture vars
    void (*onResult)(Result, void*) = ((Actor_Post_Capture3*) _data)->onResult;
    void* data = ((Actor_Post_Capture3*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
        
        MyServer *pServer = (MyServer *)pActor;
        MyServer_Print(pServer);
        
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    Actor_Post_Capture3_Delete((Actor_Post_Capture3*)_data);
} //lambda




void MyServer_Post_Print(MyServer* pServer,
                           void (*onResult)(Result, void*),
                           void* data)
{
    Result result;
    

    Actor_Post_Capture3* _cap;
    result = Actor_Post_Capture3_Init(&_cap, onResult, data);
    if (result == RESULT_OK)
    {
        Actor_Post( &pServer->actor, Actor_Post_Lambda3, _cap);
    
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
    int i;
    void (*onResult)(Result, void*);
    void* data;
} Actor_Post_Capture5;

static Result Actor_Post_Capture5_Init(Actor_Post_Capture5** pp,
                                       const char* name,
                                       const char* httpresponse,
                                       int i,
                                       void (*onResult)(Result, void*),
                                       void* data)
{
    Result result;
    Actor_Post_Capture5 *p = (Actor_Post_Capture5*)malloc(sizeof(Actor_Post_Capture5));
    result = p ? RESULT_OK : RESULT_OUTOFMEM;
    if (result == RESULT_OK)
    {
        p->name = _strdup(name);
        result == (p->name != NULL) ? RESULT_OK : RESULT_FAIL;
        if (result == RESULT_OK)
        {
            p->httpresponse = _strdup(httpresponse);
            result == (p->httpresponse != NULL) ? RESULT_OK : RESULT_FAIL;
            if (result == RESULT_OK)
            {
                p->i = i;
                p->onResult = onResult;
                p->data = data;
                *pp = p;
                goto end;
            }
                free((void*)p->httpresponse);
        }
            free((void*)p->name);
        free((void*)p);
    }
end:
    return result;
}

static void Actor_Post_Capture5_Delete(Actor_Post_Capture5* p)
{
    free((void*)p->name);
    free((void*)p->httpresponse);
    free((void*)p);
}

static void Actor_Post_Lambda5(Result result, Actor* pActor, void* _data)
{
    //capture vars
    const char* name = ((Actor_Post_Capture5*) _data)->name;
    const char* httpresponse = ((Actor_Post_Capture5*) _data)->httpresponse;
    int i = ((Actor_Post_Capture5*) _data)->i;
    void (*onResult)(Result, void*) = ((Actor_Post_Capture5*) _data)->onResult;
    void* data = ((Actor_Post_Capture5*) _data)->data;


    if (result == RESULT_OK)
    {
        //succeded!!
        
        MyServer *pServer = (MyServer *)pActor;
        MyServer_Print2(pServer, name);
        // async [const char* httpresponse] AsynPool_Run() -> void
        //{
        //printf("chega em outro lugar %s\n", httpresponse);
        //}
        
        onResult(result, data); //target no result
    }
    else
    {
        onResult(result, data);//target error call
    }//else

    Actor_Post_Capture5_Delete((Actor_Post_Capture5*)_data);
} //lambda




void MyServer_Post_Print2(MyServer* pServer,
                            const char* name,
                            const char* httpresponse,
                            int i,
                            void (*onResult)(Result, void*),
                            void* data)
{
    Result result;
    

    Actor_Post_Capture5* _cap;
    result = Actor_Post_Capture5_Init(&_cap, name, httpresponse, i, onResult, data);
    if (result == RESULT_OK)
    {
        Actor_Post( &pServer->actor, Actor_Post_Lambda5, _cap);
    
    }
    else
    {
        onResult(result, data);//target error call
    }
}

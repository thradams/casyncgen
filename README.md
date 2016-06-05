# casyncgen


CAsyncGen é um tranformador de código que 
produz um encadeamento de callbacks (closures) na linguagem C.
Este encademento permite a criação de código assincrono através de um padrão 
que de chamadas.
Em C++, é possível criar estes encademanetos com std::function e lambdas.

Exemplo
```cpp
void ReadFile(const char* filename,
              function<void (Result)> callback)
{
   readFile(filename, [callback](Data* data)
   {
     //usa data para algo..
     
     //reporta que completou
     callback(OK);
   });
}

int main()
{
   ReadFile("filename", [](Result)
   {
     //completou
   });
}
```

O CAsyncGen não gera código a partir da syntaxe equivalente do C++ basicamente 
para evitar a nescessidade de excecoes.
No caso do C++, as excecoes que por ventura sejam lançadas na montagem do lambda sao capturadas de forma sincrona no chamador.
As excecoes lancadas durante a excecucao do lambda podem estar em outra thread e precisam ser capturadas para serem re-lancadas em outro lugar.

No CAsyncGen qualquer erro durante qualquer fase é reportado via a callback assim como o sucesso.


A sintaxe fica
```
async ReadFile(const char* filename) -> void
{
   async [] readFile(filename) -> Data* data
   {
     printf("continuacao");
   }  
}
```
A callback fica "escondida" e é chamada automaticamente no final do bloco mais interno ou caso acontece erro como por exemplo na inicializacao dos lambdas.

Todos os blocos internos a declaração "async" são código C tradicionais.

O output do gerador será uma função em C com a seguinte assinatura:
```c
void ReadFile(const char* filename,
              void (*callback)(Result, void*), 
              void* data);
              
void Completed(Result res, void* p)
{
}
int main()
{
   ReadFile(filename, Completed, 0);
}
```

O parametro void* que pode ser usado para passagem de argumentos para a callback.
Existe uma garantia que é "a callback SEMPRE será chamada" em caso de erro ou successo.



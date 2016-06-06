# casyncgen


CAsyncGen é um tranformador de código que 
produz um encadeamento de callbacks (closures) na linguagem C.
Este encademento permite a criação de código assincrono através de um padrão 
de chamadas.
```
async ReadFile(const char* filename) -> void
{
   async [] readFile(filename) -> Data* data
   {
     printf("continuacao");
   }  
}
```
O output do gerador será uma função em C com a seguinte assinatura:

```c
void ReadFile(const char* filename,
              void (*callback)(Result, void*), 
              void* data);
```

Que depois pode ser chamada da seguinte forma:
```cpp
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


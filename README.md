# casyncgen


CAsyncGen é um tranformador de código que 
produz um encadeamento de callbacks (closures) na linguagem C.
Este encademento permite a criação de código assincrono através de um padrão 
que de chamadas que já é bem familiar a programadores javascript.

Exemplo node.js
```js
fs.readFile('/foo.txt', function(err, data) {
  //continuacao
  console.log(data);
});
```

A syntaxe equivalente é a seguinte:
```
async ReadFile(const char* filename) -> void
{
   async [] readFile(filename) -> Data* data
   {
     printf("continuacao");
   }  
}
```
Todos os blocos internos a declaração "async" são código C tradicionais.
A continuação recebe parâmetros que são definidos após o -> .
Estes parâmetros (no caso o data) estão acessíveis na continuação.

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

A callback neste caso é a forma que a função reporta o sucesso e erros para o chamador tradicional em C.

Em C++, utilizando std::function e lambdas se atinge o mesmo efeito.

```cpp
void ReadFile(const char* filename,
              function<void (Result)> callback)
{
   readFile(filename, [](Data* data)
   {
     printf("continuacao");
   });
}

int main()
{
   ReadFile("filename", [](Result)
   {
   });
}
```

==Diferenças entre C++ CAsyncGen==

Em C++, lambdas sem captura são compatíveis com ponteiros de função, mas lambdas com captura precisam ser adaptados para interoperar com C. O CAsyncGen já entrega a interoperabilidade pronta desde que seguido a estrutura padronizada. (ou que o gerador seja adaptado)

 




# casyncgen

http://www.thradams.com/codeblog/app/casyncgen.html

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

O gerador pode ser usado com linha de comando, é um programa em node.js. Ele tambem pode rodar dentro de uma pagina html.
Junto do projeto esta um exemplo que tem thread pool e modelo de actores em C como testes de uso.

O projeto esta em um estagio inicial e nao foi usado em nenhum projeto.

O foco nao eh experimental e sim pratico e por isso a ideia é colocar o codigo dentro de um projeto existente em C/C++ entre #ifdefs.
Um processador faz o parser e acha as funcoes "async" gerando um codigo para elas.






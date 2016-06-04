# casyncgen


CAsyncGen é um tranformador de código que 
produz um encadeamento de callbacks (closures) na linguagem C.
Este encademento permite a criação de código assincrono através de um padrão 
que de chamadas que já é bem familiar a programadores javascript.

Exemplo node.js
```
fs.readFile('/foo.txt', function(err, data) {
  //continuacao
  console.log(data);
});
```

```
async ReadFile(const char* filename) -> void
{
   async [] readFile(filename) -> Data* data
   {
     printf("continuacao");
   }  
}
```

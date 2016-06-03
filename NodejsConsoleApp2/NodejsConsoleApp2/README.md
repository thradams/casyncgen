// ConsoleApplication18.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <functional>

typedef enum 
{
  RESULT_OK,
  RESULT_FAIL,
  RESULT_OUTOFMEM
} Result;


void F(void(*onResult)(Result result, int i, void*),
       void* data)
{
  onResult(RESULT_OK, 5, data);
}

int s = 2;

#ifdef _
void Read(const char* s) ->void
{
  printf("antes1");
  printf("antes2");
  printf("antes3");

  async [const char* s] F()->int i 
  {
    printf("hello! %d %s", i, s);
    //alguma coisa errada
    result = RESULT_FAIL;
  }
}
#endif
#include "generated.cpp"



void Catch(Result result, void* data){
  if (result == RESULT_OK)
    printf("sucesso");
  else 
    printf("falha");
}

void F(std::function<void ()> onResult)
{
  onResult();
}

int main()
{
  Read("thiago", Catch, 0);
  return 0;
}



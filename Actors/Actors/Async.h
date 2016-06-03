#pragma once
#include "Result.h"

Result AsynPool_Init();

void AsynPool_Run(void (*callback)(Result, void*),
                  void* data);

void AsynPool_Join();

# interceptor.ts
A General Interceptor implementation for TS classes

## Define an interceptor

``` typescript
import { Interceptor } from 'interceptor-ts'

type HelloSignature = (target: string) => number;
class MyInterceptor implements Interceptor<HelloSignature> {
    intercept(next: () => number, target: string): number {
        console.log('before');
        const result = next();
        console.log('after');
        return result;
    }
}
```


ApplyInterceptor on a method
``` typescript
import { useInterceptors } from 'interceptor-ts'

class TestClass {
    @useInterceptors([new MyInterceptor()])
    sayHello(name: string): bool {
        console.log('Hello', name)
        return true;
    }
}
```

Now call the method
``` typescript
const test = new TestClass();
test.sayHello('James');
```

The output would be
```
[LOG]: "before" 
[LOG]: "Hello, James" 
[LOG]: "after" 
```

## Repalace parameters in an interceptor
``` typescript
import { Interceptor } from 'interceptor-ts'

type HelloSignature = (target: string) => number;
class MyInterceptor implements Interceptor<HelloSignature> {
    intercept(next: () => number, target: string): number {
        console.log('before');
        const result = next('Mr Bond');
        console.log('after');
        return result;
    }
}
```

Now call the method
``` typescript
const test = new TestClass();
test.sayHello('James');
```

The output would be
```
[LOG]: "before" 
[LOG]: "Hello, Mr Bond" 
[LOG]: "after" 
```



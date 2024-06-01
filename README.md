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

## use the interceptor in a Nest.js application

You need to import the interceptor module into your module

``` typescript
@Module({
    imports: [NestInterceptorModule], // import the interceptor module
    providers: [DemoService, MyInterceptor]
})
class AppModule{}
```

Define an interceptor in your module as a provider
``` typescript
@Injectable()
class MyInterceptor implements Interceptor<(name: string) => number> {
    intercept(next: (name: string) => number, name: string): number {
        console.log('before');
        const result = next(`Mr. ${name}`);
        console.log('end');
        return result;
    }
}
```

Inject the interceptor to a method of your provider. The provider must implement OnModuleInit and call interceptorLoader.initInterceptors to initialize all interceptors on it
``` typescript
@Injectable()
class MyService implements OnModuleInit {
    constructor(
        @Inject(ModuleRef) private moduleRef: ModuleRef,
        @Inject(InterceptorLoader) private interceptorLoader: InterceptorLoader
    ) {

    }

    onModuleInit() {
        // initialize all interceptors when module init is required
        this.interceptorLoader.initInterceptors(this.moduleRef);
    }

    // use interceptor om the function
    @useInterceptors([MyInterceptor])
    sayHello(name: string): number {
        console.log(`Hello ${name}!`);
        return 0;
    }
}
```

Now you may use your provider as ``` myProvider.sayHello('James Bond'); ```. And the output will be
```
[LOG]: "before" 
[LOG]: "Hello, Mr James Bond" 
[LOG]: "after" 
```


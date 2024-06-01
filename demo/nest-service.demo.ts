import { Inject, Injectable, Module, OnModuleInit, Scope } from '@nestjs/common';
import { InterceptorLoader, useInterceptors, NestInterceptorModule } from '../src/nestjs'
import { AnyFunction, Interceptor } from '../src/methodInterceptor';
import { ModuleRef, NestFactory } from '@nestjs/core';


@Injectable()
class MyInterceptor implements Interceptor<(name: string) => number> {
    intercept(next: (name: string) => number, name: string): number {
        console.log('before');
        const result = next(`Mr. ${name}`);
        console.log('end');
        return result;
    }
}

@Injectable()
class MyInterceptor2 implements Interceptor<(name: string) => number> {
    intercept(next: Function, name: string): number {
        console.log('before 2');
        const result = next();
        console.log('end 2');
        return result;
    }
}


@Injectable()
class DemoService implements OnModuleInit {
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
    @useInterceptors([MyInterceptor, MyInterceptor2])
    sayHello(name: string): number {
        console.log(`Hello ${name}!`);
        return 0;
    }
}

@Module({
    imports: [NestInterceptorModule], // import the interceptor module
    providers: [DemoService, MyInterceptor, MyInterceptor2]
})
class AppModule{}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    await app.init()
    const demo: DemoService = app.get<DemoService>(DemoService);
    // call the intercepted metod
    // the interceptor should be in use
    demo.sayHello('James Bond');
  }
  bootstrap();
import { Module } from "@nestjs/common";
import { InterceptorLoader } from "./service";

@Module({
    providers: [InterceptorLoader],
    exports: [InterceptorLoader]
})
export class NestInterceptorModule {}
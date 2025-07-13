import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ 
    summary: 'Prometheus metrics endpoint',
    description: 'Returns metrics in Prometheus format for monitoring and alerting'
  })
  @ApiExcludeEndpoint() // Hide from Swagger docs as it's for monitoring tools
  async index(@Res() response: Response): Promise<string> {
    return super.index(response);
  }
}
import { Module } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { VaultsController } from './vaults.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [VaultsService],
  controllers: [VaultsController],
  exports: [VaultsService],
})
export class VaultsModule {}

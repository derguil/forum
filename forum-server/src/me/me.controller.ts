import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MeService } from './me.service';
import { CreateMeDto } from './dto/create-me.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  // @Get('posts')
  // findAll() {
  //   return this.meService.findAll();
  // }

  // @Get('comments')
  // findAll() {
  //   return this.meService.findAll();
  // }

  // @Get('scraps')
  // findAll() {
  //   return this.meService.findAll();
  // }
}

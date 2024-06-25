import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  addBookmark(
    @GetUser('userId') userId: string,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.addBookmark(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getBookmarks(@GetUser('userId') userId: string) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getBookmarkById(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  editBookmark(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmark(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmark(
    @GetUser('userId') userId: string,
    @Param('id') bookmarkId: string,
  ) {
    return this.bookmarkService.deleteBookmark(userId, bookmarkId);
  }
}

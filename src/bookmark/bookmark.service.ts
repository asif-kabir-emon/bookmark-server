import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async addBookmark(userId: string, dto: CreateBookmarkDto) {
    const createdBookmark = await this.prisma.bookmark.create({
      data: {
        ...dto,
        userId: userId,
      },
    });
    return createdBookmark;
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
    return bookmarks;
  }

  async getBookmarkById(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    return bookmark;
  }

  async updateBookmark(
    userId: string,
    bookmarkId: string,
    dto: EditBookmarkDto,
  ) {
    const isBookmarkExist = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
      },
    });
    if (!isBookmarkExist || isBookmarkExist.userId !== userId) {
      throw new ForbiddenException('Access to resource is denied.');
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
        userId,
      },
      data: dto,
    });
    return updatedBookmark;
  }

  async deleteBookmark(userId: string, bookmarkId: string) {
    const isBookmarkExist = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
      },
    });
    if (!isBookmarkExist || isBookmarkExist.userId !== userId) {
      throw new ForbiddenException('Delete is denied.');
    }

    const deletedBookmark = await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    return deletedBookmark;
  }
}

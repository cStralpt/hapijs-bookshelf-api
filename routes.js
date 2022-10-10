const { query } = require("@hapi/hapi/lib/validation");
const { nanoid } = require("nanoid");
let books = [];
const routes = [
  {
    method: "POST",
    // path: "/{any*}",
    path: "/books",
    handler: (request, h) => {
      try {
        const body = request.payload;
        const createdAt = new Date().toISOString();
        const id = nanoid(16);
        let newBooks = {
          id: id,
          ...body,
          insertedAt: createdAt,
          updatedAt: createdAt,
        };
        //   console.log(newBooks);
        const { name, readPage, pageCount } = body;
        if (name == undefined) {
          return h
            .response({
              status: "fail",
              message: "Gagal menambahkan buku. Mohon isi nama buku",
            })
            .code(400);
        }
        if (readPage > pageCount) {
          return h
            .response({
              status: "fail",
              message:
                "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
            })
            .code(400);
        }
        newBooks.finished = newBooks.pageCount === newBooks.readPage;
        books.push(newBooks);
        //   console.log(newBooks);
        return h
          .response({
            status: "success",
            message: "Buku berhasil ditambahkan",
            data: {
              bookId: id,
            },
          })
          .code(201);
      } catch (error) {
        return h
          .response({
            status: "error",
            message: "Buku gagal ditambahkan",
          })
          .code(500);
      }
    },
  },
  {
    method: "GET",
    // path: "/{any*}",
    path: "/books",
    handler: (request, h) => {
      const body = request.payload;
      // console.log(request.query?.name.toLowerCase());
      // const getBookByFinished = books.filter(
      //   (book) => book.finished == request.query.finished
      // );
      let getBookByReading_filtered = [];
      const getBokkFilteredByReading = () => {
        for (let index = 0; index < books.length; index++) {
          const getBookByReading = books[index];
          if (getBookByReading.reading == request.query.reading) {
            getBookByReading_filtered.push({
              name: getBookByReading.name,
              publisher: getBookByReading.publisher,
            });
          }
        }
        // console.log(getBookByReading_filtered);
      };
      if (request.query.name) {
        return h
          .response({
            status: "success",
            data: {
              books: books.filter((book) => {
                let bookFilteredByName;
                if (
                  request.query.name.toLowerCase().includes(book.name.toLowerCase())
                ) {
                  bookFilteredByName = {
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                  };
                }
                return bookFilteredByName;
              }),
            },
          })
          .code(200);
      }
      if (request.query.finished) {
        return h
          .response({
            status: "success",
            data: {
              books: books.filter((book) => {
                let getAllFinishedBooks;
                if (book.finished == request.query.finished) {
                  getAllFinishedBooks = {
                    name: book.name,
                    publisher: book.publisher,
                  };
                  return getAllFinishedBooks;
                }
              }),
            },
          })
          .code(200);
      }
      if (request.query.reading) {
        try {
          getBokkFilteredByReading();
        } catch (error) {
          console.log({ errorSiReading: error.message });
        }
        return h
          .response({
            status: "success",
            data: {
              books: getBookByReading_filtered,
            },
          })
          .code(200);
      }
      return h
        .response({
          status: "success",
          data: {
            books: books.map((book) => {
              let bookFilteredByName;
              bookFilteredByName = {
                id: book.id,
                name: book.name,
                publisher: book.publisher,
              };
              console.log(bookFilteredByName);
              return bookFilteredByName;
            }),
          },
        })
        .code(200);
    },
  },
  {
    method: "GET",
    // path: "/{any*}",
    path: "/books/{bookId}",
    handler: (request, h) => {
      const bookId = request.params.bookId;
      const getBookByID = books.filter((b) => b.id === bookId);
      if (getBookByID[0] === undefined) {
        return h
          .response({
            status: "fail",
            message: "Buku tidak ditemukan",
          })
          .code(404);
      }
      return h
        .response({
          status: "success",
          data: {
            book: getBookByID[0],
          },
        })
        .code(200);
    },
  },
  {
    method: "PUT",
    // path: "/{any*}",
    path: "/books/{bookId}",
    handler: (request, h) => {
      //   console.log(books.findIndex(getBookByID[0]));
      const body = request.payload;
      const bookId = request.params.bookId;
      const getBookByID = books.filter((b) => b.id === bookId);
      const {
        name,
        year,
        summary,
        author,
        publisher,
        pageCount,
        readPage,
        reading,
      } = body;
      if (name == undefined) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Mohon isi nama buku",
          })
          .code(400);
      }
      if (readPage > pageCount) {
        return h
          .response({
            status: "fail",
            message:
              "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
          })
          .code(400);
      }
      if (getBookByID[0] === undefined) {
        return h
          .response({
            status: "fail",
            message: "Gagal memperbarui buku. Id tidak ditemukan",
          })
          .code(404);
      }
      let bookIndex;
      for (let index = 0; index < books.length; index++) {
        if (books[index].id == bookId) {
          bookIndex = index;
          break;
        }
      }
      const updateBookData = () => {
        const currentDate = new Date().toISOString();
        const { id, finished, insertedAt } = books[bookIndex];
        books[bookIndex] = {
          id,
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished: readPage === pageCount,
          reading,
          updatedAt: currentDate,
          insertedAt,
        };
        // console.log({
        //   id,
        //   name,
        //   year,
        //   author,
        //   publisher,
        //   pageCount,
        //   readPage,
        //   finished: readPage === pageCount,
        //   reading,
        //   updatedAt: currentDate,
        //   insertedAt,
        // });
      };
      updateBookData();
      return h
        .response({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
        .code(200);
    },
  },
  {
    method: "DELETE",
    // path: "/{any*}",
    path: "/books/{bookId}",
    handler: (request, h) => {
      //   console.log(books.findIndex(getBookByID[0]));
      const body = request.payload;
      const bookId = request.params.bookId;
      const getBookByID = books.filter((b) => b.id === bookId);
      if (getBookByID[0] === undefined) {
        return h
          .response({
            status: "fail",
            message: "Buku gagal dihapus. Id tidak ditemukan",
          })
          .code(404);
      }
      let bookIndex;
      for (let index = 0; index < books.length; index++) {
        if (books[index].id == bookId) {
          bookIndex = index;
          break;
        }
      }
      books.pop(0);
      return h
        .response({
          status: "success",
          message: "Buku berhasil dihapus",
        })
        .code(200);
    },
  },
];
//TODO: GENERIC ERROR
module.exports = routes;

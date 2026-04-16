import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (res, file, cb) {
    cb(null, "./Public/temp")
  },
  filename: function (res, file, cb) {
    cb(null, file.originalname)
  },
})

export const upload = multer({
  storage,
})
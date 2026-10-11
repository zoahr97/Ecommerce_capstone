const uploadProductImage = (
  req,
  res
) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'Please select an image'
    });
  }

  const imageUrl =
    `${req.protocol}://` +
    `${req.get('host')}` +
    `/uploads/products/` +
    `${req.file.filename}`;

  return res.status(201).json({
    message:
      'Image uploaded successfully',
    imageUrl
  });
};

module.exports = {
  uploadProductImage
};
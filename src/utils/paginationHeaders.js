const paginationHeaders = module.exports.paginationHeaders = ({
  page = 1,
  total,
  perPage = 20,
}) => {

  const totalPages = Math.ceil(
    total / perPage
  );

  const headers = {
    'X-Page': page,
    'X-Per-Page': perPage,
    'X-Total': total,
    'X-Total-Pages': totalPages,
  };

  if (page < totalPages) {
    headers['X-Next-Page'] = page + 1
  }

  if (page > 1) {
    headers['X-Prev-Page'] = page - 1;
  }

  return headers;
}
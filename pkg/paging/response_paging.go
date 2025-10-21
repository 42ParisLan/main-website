package paging

func CreatePagingResponse[T any](items []T, total, page, limit int) *Response[T] {
	if limit <= 0 {
		limit = 10
	}
	if page < 0 {
		page = 0
	}
	totalPages := (total + limit - 1) / limit
	return &Response[T]{
		Items:      items,
		Page:       page,
		TotalPages: totalPages,
		Limit:      limit,
		Total:      total,
	}
}

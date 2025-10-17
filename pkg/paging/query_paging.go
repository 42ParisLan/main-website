package paging

type QueryWithPagingCapability[T any, T2 any] interface {
	Offset(offset int) T
	Limit(limit int) T
}

func ApplyQueryPaging[T QueryWithPagingCapability[T, any]](query T, input Input) T {
	offset := input.Page * input.Limit
	query.Offset(offset)
	query.Limit(input.Limit)

	return query
}

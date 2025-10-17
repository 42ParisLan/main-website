package ptr

func Make[T any](v T) *T {
	return &v
}

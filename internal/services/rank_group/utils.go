package rankgroupservice

import "fmt"

func GetOrdinal(n int) string {
	suffix := "th"
	switch n % 100 {
	case 11, 12, 13:
		suffix = "th"
	default:
		switch n % 10 {
		case 1:
			suffix = "st"
		case 2:
			suffix = "nd"
		case 3:
			suffix = "rd"
		}
	}
	return fmt.Sprintf("%d%s", n, suffix)
}

func GetNameFromRankRange(rankMin int, rankMax int) string {
	name := GetOrdinal(rankMin)
	if rankMin != rankMax {
		name += fmt.Sprintf(" - %s", GetOrdinal(rankMax))
	}
	return name
}

package logger

const (
	FatalLevel = iota
	ErrorLevel
	WarnLevel
	InfoLevel
	HttpLevel
	DebugLevel
)

type Level int

func (l Level) String() string {
	switch l {
	case FatalLevel:
		return "FATAL"
	case ErrorLevel:
		return "ERROR"
	case InfoLevel:
		return "INFO"
	case WarnLevel:
		return "WARN"
	case HttpLevel:
		return "HTTP"
	case DebugLevel:
		return "DEBUG"
	default:
		return "UNKNOWN"
	}
}

func LevelFromString(level string) Level {
	switch level {
	case "FATAL":
		return FatalLevel
	case "ERROR":
		return ErrorLevel
	case "INFO":
		return InfoLevel
	case "WARN":
		return WarnLevel
	case "HTTP":
		return HttpLevel
	case "DEBUG":
		return DebugLevel
	default:
		return InfoLevel
	}
}

// Color codes
const (
	ColorRed      = "\033[31m"
	ColorYellow   = "\033[33m"
	ColorBlue     = "\033[34m"
	ColorReset    = "\033[0m"
	ColorGreen    = "\033[32m"
	ColorWhite    = "\033[37m"
	ColorPurple   = "\033[35m"
	ColorBgRed    = "\033[41m"
	ColorBgGreen  = "\033[42m"
	ColorBgBlue   = "\033[44m"
	ColorBgWhite  = "\033[47m"
	ColorBgYellow = "\033[43m"
	ColorBgPurple = "\033[45m"
	ColorBold     = "\033[1m"
)

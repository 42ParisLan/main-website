package logger

import (
	"fmt"
	"time"
)

var globalLevel Level = InfoLevel

var jsonLog bool = false

func SetGlobalLevel(level Level) {
	globalLevel = level
}

func SetJsonLog() {
	jsonLog = true
}

type Logger struct {
	context   *string
	withColor bool
}

func New() *Logger {
	return &Logger{
		context:   nil,
		withColor: true,
	}
}

func (l *Logger) WithContext(context string) *Logger {
	l.context = &context
	return l
}

func (l *Logger) WithNoColor() *Logger {
	l.withColor = false
	return l
}

func (l *Logger) Info(message string, args ...interface{}) {
	if globalLevel >= InfoLevel {
		l.log(InfoLevel, message, args...)
	}
}

func (l *Logger) Http(message string, args ...interface{}) {
	if globalLevel >= HttpLevel {
		l.log(HttpLevel, message, args...)
	}
}

func (l *Logger) Error(message string, args ...interface{}) {
	if globalLevel >= ErrorLevel {
		l.log(ErrorLevel, message, args...)
	}
}

func (l *Logger) Warn(message string, args ...interface{}) {
	if globalLevel >= WarnLevel {
		l.log(WarnLevel, message, args...)
	}
}

func (l *Logger) Debug(message string, args ...interface{}) {
	if globalLevel >= DebugLevel {
		l.log(DebugLevel, message, args...)
	}
}

func (l *Logger) Fatal(message string, args ...interface{}) {
	l.log(FatalLevel, message, args...)
	panic(fmt.Sprintf(message, args...))
}

// format is 12/07/2021 15:04:05 [Info] [Context?] message
func (l *Logger) log(level Level, message string, args ...interface{}) {
	if jsonLog {
		l.logJson(level, message, args...)
		return
	}
	colorLogLvl, colorMessage := l.getLogColors(level)
	if l.withColor {
		fmt.Printf("%s %s %s", colorLogLvl, level.String(), ColorReset)
	} else {
		fmt.Printf(" %s ", level.String())
	}
	fmt.Printf(" %s", time.Now().Format("02/01/2006 15:04:05"))
	if l.context != nil {
		if l.withColor {
			fmt.Printf(" %s[%s]%s", ColorYellow+ColorBold, *l.context, ColorReset)
		} else {
			fmt.Printf(" [%s]", *l.context)
		}
	}
	if l.withColor {
		fmt.Printf(" %s%s%s\n", colorMessage, fmt.Sprintf(message, args...), ColorReset)
	} else {
		fmt.Printf(" %s\n", fmt.Sprintf(message, args...))
	}
}

func (l *Logger) logJson(level Level, message string, args ...interface{}) {
	fmt.Printf("{\"level\":\"%s\",\"time\":\"%s\"", level.String(), time.Now().Format(time.RFC3339))
	if l.context != nil {
		fmt.Printf(",\"context\":\"%s\"", *l.context)
	}
	fmt.Printf(",\"message\":\"%s\"}\n", fmt.Sprintf(message, args...))
}

func (l *Logger) getLogColors(level Level) (string, string) {
	switch level {
	case InfoLevel:
		return ColorBgGreen, ColorGreen
	case ErrorLevel:
		return ColorBgRed, ColorRed
	case FatalLevel:
		return ColorBgRed, ColorRed
	case WarnLevel:
		return ColorBgYellow, ColorYellow
	case HttpLevel:
		return ColorBgWhite, ColorBlue
	case DebugLevel:
		return ColorBgPurple, ColorPurple
	default:
		return "", ""
	}
}

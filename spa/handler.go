package spa

import (
	"embed"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type SPAHandler struct {
	staticPath string
	indexPath  string
	publicFS   fs.FS
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h SPAHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := filepath.Join(h.staticPath, r.URL.Path)
	path = strings.TrimPrefix(path, h.staticPath+"/")
	fi, err := fs.Stat(h.publicFS, path)
	if os.IsNotExist(err) || fi.IsDir() {
		http.ServeFileFS(w, r, h.publicFS, h.indexPath)
		return
	}

	if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 404 not found error and stop
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// otherwise, use http.FileServer to serve the static file
	http.FileServer(http.FS(h.publicFS)).ServeHTTP(w, r)
}

// NewSPAHandler creates a new SPAHandler
func NewSPAHandler(staticPath string, indexPath string, nextFS embed.FS) (*SPAHandler, error) {
	publicFS, err := fs.Sub(nextFS, staticPath)
	if err != nil {
		return nil, err
	}
	return &SPAHandler{staticPath, indexPath, publicFS}, nil
}

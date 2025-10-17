package intraclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const intraURL = "https://api.intra.42.fr/v2/"

func (c *Client) get(path string, output interface{}) error {
	// we create a new request
	req, err := http.NewRequest("GET", fmt.Sprintf("%s%s", intraURL, path), nil)
	if err != nil {
		return err
	}

	// we send the request
	return c.do(req, output)
}

// getWithParams makes a GET request with query parameters
func (c *Client) getWithParams(path string, params map[string]string, output interface{}) error {
	// Parse the base URL
	baseURL := fmt.Sprintf("%s%s", intraURL, path)
	u, err := url.Parse(baseURL)
	if err != nil {
		return err
	}

	// Add query parameters
	q := u.Query()
	for key, value := range params {
		q.Set(key, value)
	}
	u.RawQuery = q.Encode()

	// Create the request
	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		return err
	}

	// Send the request
	return c.do(req, output)
}

// pages fetches all pages of a paginated API endpoint and returns the combined results
func (c *Client) pages(path string, params map[string]string) ([]json.RawMessage, error) {
	// Initialize parameters with defaults
	if params == nil {
		params = make(map[string]string)
	}

	// Set default page and per_page if not provided
	if _, ok := params["page"]; !ok {
		params["page"] = "1"
	}
	if _, ok := params["per_page"]; !ok {
		params["per_page"] = "100"
	}

	var allResults []json.RawMessage
	currentPage, _ := strconv.Atoi(params["page"])

	for {
		params["page"] = strconv.Itoa(currentPage)

		// Parse the base URL
		baseURL := fmt.Sprintf("%s%s", intraURL, path)
		u, err := url.Parse(baseURL)
		if err != nil {
			return nil, err
		}

		// Add query parameters
		q := u.Query()
		for key, value := range params {
			q.Set(key, value)
		}
		u.RawQuery = q.Encode()

		// Create the request
		req, err := http.NewRequest("GET", u.String(), nil)
		if err != nil {
			return nil, err
		}

		// Send the request
		resp, err := c.httpClient.Do(req)
		if err != nil {
			return nil, err
		}

		// Check for errors
		if resp.StatusCode >= 400 {
			body, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				return nil, err
			}
			return nil, fmt.Errorf("error: %s: %s", resp.Status, body)
		}

		// Parse the current page results
		var pageResults []json.RawMessage
		if err := json.NewDecoder(resp.Body).Decode(&pageResults); err != nil {
			resp.Body.Close()
			return nil, err
		}

		// Check pagination headers
		xTotal := resp.Header.Get("X-Total")
		xPerPage := resp.Header.Get("X-Per-Page")
		resp.Body.Close()

		// Add current page results to all results
		allResults = append(allResults, pageResults...)

		// If no pagination headers or no more pages, break
		if xTotal == "" || xPerPage == "" {
			break
		}

		total, err := strconv.Atoi(xTotal)
		if err != nil {
			break
		}

		perPage, err := strconv.Atoi(xPerPage)
		if err != nil {
			break
		}

		lastPage := int(math.Ceil(float64(total) / float64(perPage)))

		// If we've reached the last page or got fewer results than expected, break
		if currentPage >= lastPage || len(pageResults) < perPage {
			break
		}

		currentPage++
	}

	return allResults, nil
}

func (c *Client) post(path string, input interface{}, output interface{}) error {
	// we create a new request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s%s", intraURL, path), nil)
	if err != nil {
		return err
	}

	// we set the body of the request
	err = setBody(req, input)
	if err != nil {
		return err
	}

	// we send the request
	return c.do(req, output)
}

func setBody(req *http.Request, input interface{}) error {
	// we marshal the input
	body, err := json.Marshal(input)
	if err != nil {
		return err
	}

	// we set the body of the request
	req.Body = io.NopCloser(bytes.NewReader(body))
	req.ContentLength = int64(len(body))
	req.Header.Set("Content-Type", "application/json")
	return nil
}

func (c *Client) put(path string, input interface{}, output interface{}) error {
	// we create a new request
	req, err := http.NewRequest("PUT", fmt.Sprintf("%s%s", intraURL, path), nil)
	if err != nil {
		return err
	}

	// we set the body of the request
	err = setBody(req, input)
	if err != nil {
		return err
	}

	// we send the request
	return c.do(req, output)
}

func (c *Client) patch(path string, input interface{}, output interface{}) error {
	// we create a new request
	req, err := http.NewRequest("PATCH", fmt.Sprintf("%s%s", intraURL, path), nil)
	if err != nil {
		return err
	}

	// we set the body of the request
	err = setBody(req, input)
	if err != nil {
		return err
	}

	// we send the request
	return c.do(req, output)
}

func (c *Client) delete(path string, output interface{}) error {
	// we create a new request
	req, err := http.NewRequest("DELETE", fmt.Sprintf("%s%s", intraURL, path), nil)
	if err != nil {
		return err
	}

	// we send the request
	return c.do(req, output)
}

func (c *Client) do(req *http.Request, output interface{}) error {
	tries := 0
	var err error
	for tries < 4 {
		resp, err := c.httpClient.Do(req)
		if err != nil {
			return err
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusTooManyRequests {
			time.Sleep(1 * time.Second)
			// we retry the request without incrementing the tries
			continue
		}

		// in case of a server error, we retry the request
		if resp.StatusCode >= 500 {
			tries++
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				err = fmt.Errorf("error: %s: %s", resp.Status, body)
			}
			continue
		}

		// if the response is an error, we return it
		if resp.StatusCode >= 400 {
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return err
			}
			return fmt.Errorf("error: %s: %s", resp.Status, body)
		}

		// if no content is expected (status code 204), we return
		if resp.StatusCode == 204 {
			return nil
		}
		// we decode the response
		err = json.NewDecoder(resp.Body).Decode(output)
		if err != nil {
			return err
		}

		return nil
	}
	return err
}

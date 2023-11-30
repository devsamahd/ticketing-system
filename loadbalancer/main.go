package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// Server interface represents a load balancer server
type Server interface {
	Address() string
	IsAlive() bool
	Serve(rw http.ResponseWriter, req *http.Request)
}

// LoadBalancer interface represents a simple round-robin load balancer
type LoadBalancer interface {
	GetNextAvailableServer() Server
	ServeProxy(rw http.ResponseWriter, req *http.Request)
}

// simpleServer implements the Server interface
type simpleServer struct {
	addr  string
	proxy *httputil.ReverseProxy
}

func (s *simpleServer) Address() string { return s.addr }

func (s *simpleServer) IsAlive() bool { return true }

func (s *simpleServer) Serve(rw http.ResponseWriter, req *http.Request) {
	s.proxy.ServeHTTP(rw, req)
}

func newSimpleServer(addr string) *simpleServer {
	serverURL, err := url.Parse(addr)
	if err != nil {
		log.Fatal(err)
	}

	return &simpleServer{
		addr:  addr,
		proxy: httputil.NewSingleHostReverseProxy(serverURL),
	}
}

// roundRobinLoadBalancer implements the LoadBalancer interface
type roundRobinLoadBalancer struct {
	port            string
	roundRobinCount int
	servers         []Server
}

func (lb *roundRobinLoadBalancer) GetNextAvailableServer() Server {
	server := lb.servers[lb.roundRobinCount%len(lb.servers)]
	for !server.IsAlive() {
		lb.roundRobinCount++
		server = lb.servers[lb.roundRobinCount%len(lb.servers)]
	}
	lb.roundRobinCount++

	return server
}

func (lb *roundRobinLoadBalancer) ServeProxy(rw http.ResponseWriter, req *http.Request) {
	targetServer := lb.GetNextAvailableServer()

	fmt.Printf("forwarding request to address %q\n", targetServer.Address())
	targetServer.Serve(rw, req)
}

func newRoundRobinLoadBalancer(port string, servers []Server) *roundRobinLoadBalancer {
	return &roundRobinLoadBalancer{
		port:    port,
		servers: servers,
	}
}

func main() {
	servers := []Server{
		newSimpleServer("https://www.facebook.com"),
		newSimpleServer("https://www.bing.com"),
		newSimpleServer("https://www.duckduckgo.com"),
	}

	lb := newRoundRobinLoadBalancer("8000", servers)
	handleRedirect := func(rw http.ResponseWriter, req *http.Request) {
		lb.ServeProxy(rw, req)
	}

	// register a proxy handler to handle all requests
	http.HandleFunc("/", handleRedirect)

	fmt.Printf("serving requests at 'localhost:%s'\n", lb.port)
	log.Fatal(http.ListenAndServe(":"+lb.port, nil))
}

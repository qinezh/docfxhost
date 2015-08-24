# About
Website integrated with docfx, can build & host documentation of your .Net repo in GitHub

# 1. Prerequisites

+ Need install and run [ElasticSearch](https://www.elastic.co/products/elasticsearch)
+ Need setup GitHub application(Setting->Applications->Register new application)

# 2. Config

+ Change `config/default.json` with your ElasticSearch and GitHub application parameters
+ Add `docfx.exe` to your windows environment path

# 3. Run

In your terminal, run `npm install` and `npm start`, then you can visit the website in [localhost:8000](locahost:8000)

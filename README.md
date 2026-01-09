# YouTube Money Exporter

Each hour, data is fetched and stored in a file

Whenever you want, you can force the refresh by calling `GET /api/<provider>`   
You can get the data already saved with `GET /api/last`  
Finally, you can get all the data with `GET /api/`

## Getting started
### Portainer
1. Create a new stack
2. Use the "github repository" creation tool
3. Paste the github repository
4. Set all envs variables (see next section)
5. Save & create the container

## Providers
If you don't need a provider, don't put anything in environnement variable
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/`     | Return all data    | This use cache, it's instant |
### YouTube
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/youtube/`     | Fetch new data    | This took ≈ 0.5s, a scheduled task will run this each hour |
| `GET api/youtube/last` | Get the last data | This is instant                                           |

**Setup environment variables**
```
GCP_CLIENT_ID
GCP_CLIENT_SECRET
GCP_REFRESH_TOKEN
```
1. Login to Google Cloud Platform
2. Create a new project
3. Activate APIs
   1. YouTube Analytics API
   2. YouTube Data API
   3. YouTube Reporting API
4. Ask your favorite AI how to get CLIENT_ID, CLIENT_SECRET and REFRESH_TOKEN
   1. You will have to use https://developers.google.com/oauthplayground/ to get your REFRESH_TOKEN

### Amazon
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/amazon/`     | Fetch new data    | This took ≈ 10s, a scheduled task will run this each hour |
| `GET api/amazon/last` | Get the last data | This is instant                                           |

**Setup environment variables**
```
AMAZON_LOGIN
AMAZON_PASSWORD
AMAZON_SECRET_KEY
```
1. You just need to set your credentials in the `.env` file. Don't commit it !!  
2. If you configured OTP security, you should put the key in the `AMAZON_SECRET_KEY` variable
   1. Be sure the default method is OTP, and not SMS


### Domadoo
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/domadoo/`     | Fetch new data    | This took ≈ 20s, a scheduled task will run this each hour |
| `GET api/domadoo/last` | Get the last data | This is instant                                           |

**Setup environment variables**
```
DOMADOO_LOGIN
DOMADOO_PASSWORD
```
1. You just need to set your credentials in the `.env` file. Don't commit it !!  
   

## Home Assistant
You can use this code to get entities in Home Assistant `configuration.yaml`
```
- resource: http://<ip>:3333/api/
  scan_interval: 3600
  sensor:
    # --- YOUTUBE ---
    - name: "YouTube Revenue Ce Mois"
      unique_id: yt_rev_this_month
      value_template: >
        {{ value_json.youtube.thisMonth.estimatedRevenue | replace('€', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "€"
      device_class: monetary

    - name: "YouTube Revenue 30j"
      unique_id: yt_rev_30d
      value_template: >
        {{ value_json.youtube.last30days.estimatedRevenue | replace('€', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "€"
      device_class: monetary

    # --- DOMADOO ---
    - name: "Domadoo Gains 30j"
      unique_id: domadoo_earnings_30d
      value_template: >
        {# Retire €, gère l'espace insécable des milliers et la virgule décimale #}
        {{ value_json.domadoo.last30days.earnings | replace('€', '') | replace('\u202f', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "€"
      device_class: monetary

    - name: "Domadoo Balance"
      unique_id: domadoo_balance
      value_template: >
        {{ value_json.domadoo.total.balance | replace('€', '') | replace('\u202f', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "€"
      device_class: monetary

    # --- AMAZON ---
    - name: "Amazon Gains Ce Mois"
      unique_id: amazon_earnings_this_month
      value_template: >
        {{ value_json.amazon.thisMonth.earnings | replace('€', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "€"
      device_class: monetary

    - name: "Amazon Attente Paiement"
      unique_id: amazon_waiting_payments
      value_template: >
        {# Ici on gère le symbole $ présent dans votre JSON #}
        {{ value_json.amazon.waitingPayments | replace('$', '') | replace(',', '.') | trim | float(0) }}
      unit_of_measurement: "$"
      device_class: monetary
```
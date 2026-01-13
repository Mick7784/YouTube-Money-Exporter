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
   
### Instagram
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/instagram/`     | Fetch new data    | This took ≈ 1s, a scheduled task will run this each hour |
| `GET api/instagram/last` | Get the last data | This is instant                                           |

**Setup environment variables**
```
INSTAGRAM_USERNAME
SEARCH_API_APIKEY
```
1. Put your username
2. You have to create an account to [Search API](https://www.searchapi.io/) and get your API Key there

### Discord
**APIs**
| Route                   | Role              | Comment                                                   |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `GET api/discord/`     | Fetch new data    | This took ≈ 1s, a scheduled task will run this each hour |
| `GET api/discord/last` | Get the last data | This is instant                                           |

**Setup environment variables**
```
DISCORD_SERVER_CODE
```
1. Put the code of an invitation of a Discord server


## Home Assistant
You can use this code to get entities in Home Assistant `configuration.yaml`
```
rest:
  - resource: "<ip>:3333/api/"
    method: GET
    scan_interval: 3600
    timeout: 30

    # Capteur RAW (sert de base, + attributs)
    sensor:
      - name: youtube_money_exporter_stats_raw
        unique_id: youtube_money_exporter_stats_raw
        value_template: "{{ now().isoformat() }}"
        json_attributes:
          - youtube
          - domadoo
          - amazon
          - instagram
          - discord

      # =========================
      #          LAST UPDATE
      # =========================
      - name: "YouTube Last Update"
        unique_id: youtube_last_update
        device_class: timestamp
        value_template: "{{ value_json.youtube.lastUpdate | as_datetime | as_local }}"

      - name: "Domadoo Last Update"
        unique_id: domadoo_last_update
        device_class: timestamp
        value_template: "{{ value_json.domadoo.lastUpdate | as_datetime | as_local }}"

      - name: "Amazon Last Update"
        unique_id: amazon_last_update
        device_class: timestamp
        value_template: "{{ value_json.amazon.lastUpdate | as_datetime | as_local }}"

      - name: "Instagram Last Update"
        unique_id: instagram_last_update
        device_class: timestamp
        value_template: "{{ value_json.instagram.lastUpdate | as_datetime | as_local }}"

      - name: "Discord Last Update"
        unique_id: discord_last_update
        device_class: timestamp
        value_template: "{{ value_json.discord.lastUpdate | as_datetime | as_local }}"

      # =========================
      #            YOUTUBE
      # =========================
      - name: "YouTube Subscribers Total"
        unique_id: yt_subs_total
        unit_of_measurement: "subs"
        value_template: "{{ value_json.youtube.total.subscribers | int(0) }}"

      # --- This Month ---
      - name: "YouTube Views Ce Mois"
        unique_id: yt_views_this_month
        unit_of_measurement: "views"
        value_template: "{{ value_json.youtube.thisMonth.views | int(0) }}"

      - name: "YouTube Watch Hours Ce Mois"
        unique_id: yt_watch_hours_this_month
        unit_of_measurement: "h"
        value_template: "{{ value_json.youtube.thisMonth.estimatedHoursWatched | float(0) }}"

      - name: "YouTube Avg View Duration Ce Mois"
        unique_id: yt_avd_this_month
        unit_of_measurement: "min"
        value_template: "{{ value_json.youtube.thisMonth.averageViewDuration | float(0) }}"

      - name: "YouTube Subs Gagnés Ce Mois"
        unique_id: yt_subs_gained_this_month
        unit_of_measurement: "subs"
        value_template: "{{ value_json.youtube.thisMonth.subscribersGained | int(0) }}"

      - name: "YouTube Subs Perdus Ce Mois"
        unique_id: yt_subs_lost_this_month
        unit_of_measurement: "subs"
        value_template: "{{ value_json.youtube.thisMonth.subscribersLost | int(0) }}"

      - name: "YouTube Likes Ce Mois"
        unique_id: yt_likes_this_month
        unit_of_measurement: "likes"
        value_template: "{{ value_json.youtube.thisMonth.likes | int(0) }}"

      - name: "YouTube Comments Ce Mois"
        unique_id: yt_comments_this_month
        unit_of_measurement: "comments"
        value_template: "{{ value_json.youtube.thisMonth.comments | int(0) }}"

      - name: "YouTube Shares Ce Mois"
        unique_id: yt_shares_this_month
        unit_of_measurement: "shares"
        value_template: "{{ value_json.youtube.thisMonth.shares | int(0) }}"

      - name: "YouTube Revenue Ce Mois"
        unique_id: yt_rev_this_month
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.youtube.thisMonth.estimatedRevenue
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      # --- Last 30 days ---
      - name: "YouTube Views 30j"
        unique_id: yt_views_30d
        unit_of_measurement: "views"
        value_template: "{{ value_json.youtube.last30days.views | int(0) }}"

      - name: "YouTube Watch Hours 30j"
        unique_id: yt_watch_hours_30d
        unit_of_measurement: "h"
        value_template: "{{ value_json.youtube.last30days.estimatedHoursWatched | float(0) }}"

      - name: "YouTube Avg View Duration 30j"
        unique_id: yt_avd_30d
        unit_of_measurement: "min"
        value_template: "{{ value_json.youtube.last30days.averageViewDuration | float(0) }}"

      - name: "YouTube Subs Gagnés 30j"
        unique_id: yt_subs_gained_30d
        unit_of_measurement: "subs"
        value_template: "{{ value_json.youtube.last30days.subscribersGained | int(0) }}"

      - name: "YouTube Subs Perdus 30j"
        unique_id: yt_subs_lost_30d
        unit_of_measurement: "subs"
        value_template: "{{ value_json.youtube.last30days.subscribersLost | int(0) }}"

      - name: "YouTube Likes 30j"
        unique_id: yt_likes_30d
        unit_of_measurement: "likes"
        value_template: "{{ value_json.youtube.last30days.likes | int(0) }}"

      - name: "YouTube Comments 30j"
        unique_id: yt_comments_30d
        unit_of_measurement: "comments"
        value_template: "{{ value_json.youtube.last30days.comments | int(0) }}"

      - name: "YouTube Shares 30j"
        unique_id: yt_shares_30d
        unit_of_measurement: "shares"
        value_template: "{{ value_json.youtube.last30days.shares | int(0) }}"

      - name: "YouTube Revenue 30j"
        unique_id: yt_rev_30d
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.youtube.last30days.estimatedRevenue
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      # --- Last video ---
      - name: "YouTube Dernière Vidéo - Views"
        unique_id: yt_lastvideo_views
        unit_of_measurement: "views"
        value_template: "{{ value_json.youtube.lastVideo.stats.viewCount | int(0) }}"

      - name: "YouTube Dernière Vidéo - Likes"
        unique_id: yt_lastvideo_likes
        unit_of_measurement: "likes"
        value_template: "{{ value_json.youtube.lastVideo.stats.likeCount | int(0) }}"

      - name: "YouTube Dernière Vidéo - Comments"
        unique_id: yt_lastvideo_comments
        unit_of_measurement: "comments"
        value_template: "{{ value_json.youtube.lastVideo.stats.commentCount | int(0) }}"

      # =========================
      #            DOMADOO
      # =========================
      - name: "Domadoo Clicks 30j"
        unique_id: domadoo_clicks_30d
        unit_of_measurement: "clicks"
        value_template: "{{ value_json.domadoo.last30days.clicks | int(0) }}"

      - name: "Domadoo Unique Clicks 30j"
        unique_id: domadoo_uniques_30d
        unit_of_measurement: "clicks"
        value_template: "{{ value_json.domadoo.last30days.uniquesClicks | int(0) }}"

      - name: "Domadoo Waiting Sales 30j"
        unique_id: domadoo_waiting_sales_30d
        unit_of_measurement: "sales"
        value_template: "{{ value_json.domadoo.last30days.waitingSales | int(0) }}"

      - name: "Domadoo Approved Sales 30j"
        unique_id: domadoo_approved_sales_30d
        unit_of_measurement: "sales"
        value_template: "{{ value_json.domadoo.last30days.approvedSales | int(0) }}"

      - name: "Domadoo Gains 30j"
        unique_id: domadoo_earnings_30d
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.domadoo.last30days.earnings
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      # --- Totaux ---
      - name: "Domadoo Clicks Total"
        unique_id: domadoo_clicks_total
        unit_of_measurement: "clicks"
        value_template: "{{ value_json.domadoo.total.clicks | int(0) }}"

      - name: "Domadoo Unique Clicks Total"
        unique_id: domadoo_uniques_total
        unit_of_measurement: "clicks"
        value_template: "{{ value_json.domadoo.total.uniquesClicks | int(0) }}"

      - name: "Domadoo Approved Sales Total"
        unique_id: domadoo_approved_sales_total
        unit_of_measurement: "sales"
        value_template: "{{ value_json.domadoo.total.approvedSales | int(0) }}"

      - name: "Domadoo Gains Total"
        unique_id: domadoo_earnings_total
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.domadoo.total.earnings
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      - name: "Domadoo Paiements"
        unique_id: domadoo_payments
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.domadoo.total.payments
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      - name: "Domadoo Paiements en Attente"
        unique_id: domadoo_waiting_payments
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.domadoo.total.waitingPayments
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      - name: "Domadoo Balance"
        unique_id: domadoo_balance
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.domadoo.total.balance
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      # =========================
      #            AMAZON
      # =========================
      - name: "Amazon Clicks Ce Mois"
        unique_id: amazon_clicks_this_month
        unit_of_measurement: "clicks"
        value_template: "{{ value_json.amazon.thisMonth.clicks | int(0) }}"

      - name: "Amazon Items Ordered Ce Mois"
        unique_id: amazon_items_ordered_this_month
        unit_of_measurement: "items"
        value_template: "{{ value_json.amazon.thisMonth.itemsOrdered | int(0) }}"

      - name: "Amazon Items Shipped Ce Mois"
        unique_id: amazon_items_shipped_this_month
        unit_of_measurement: "items"
        value_template: "{{ value_json.amazon.thisMonth.itemsShipped | int(0) }}"

      - name: "Amazon Items Returned Ce Mois"
        unique_id: amazon_items_returned_this_month
        unit_of_measurement: "items"
        value_template: "{{ value_json.amazon.thisMonth.itemsReturned | int(0) }}"

      - name: "Amazon Conversion Rate Ce Mois"
        unique_id: amazon_conversion_rate_this_month
        unit_of_measurement: "%"
        value_template: >
          {{ value_json.amazon.thisMonth.conversionRate
             | replace('%','') | replace(',','.') | trim | float(0) }}

      - name: "Amazon Sum Items Shipped Ce Mois"
        unique_id: amazon_sum_items_shipped_this_month
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.amazon.thisMonth.sumItemsShipped
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      - name: "Amazon Gains Ce Mois"
        unique_id: amazon_earnings_this_month
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.amazon.thisMonth.earnings
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      - name: "Amazon Attente Paiement"
        unique_id: amazon_waiting_payments
        unit_of_measurement: "€"
        device_class: monetary
        value_template: >
          {{ value_json.amazon.waitingPayments
             | replace('€','') | replace('\u202f','') | replace(' ','')
             | replace(',','.') | trim | float(0) }}

      # =========================
      #          INSTAGRAM
      # =========================
      - name: "Instagram Followers"
        unique_id: instagram_followers
        unit_of_measurement: "followers"
        value_template: "{{ value_json.instagram.followers | int(0) }}"

      - name: "Instagram Following"
        unique_id: instagram_following
        unit_of_measurement: "following"
        value_template: "{{ value_json.instagram.following | int(0) }}"

      - name: "Instagram Posts"
        unique_id: instagram_posts
        unit_of_measurement: "posts"
        value_template: "{{ value_json.instagram.posts | int(0) }}"

      # =========================
      #            DISCORD
      # =========================
      - name: "Discord Members"
        unique_id: discord_members
        unit_of_measurement: "members"
        value_template: "{{ value_json.discord.members | int(0) }}"

      - name: "Discord Members Online"
        unique_id: discord_members_online
        unit_of_measurement: "members"
        value_template: "{{ value_json.discord.members_online | int(0) }}"

```
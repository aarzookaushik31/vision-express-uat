export const GET_STORES = `query stores($city: String, $latitude: Float, $longitude: Float, $pageNo: Int, $pageSize: Int, $query: String, $range: Int) {
  stores(
    city: $city
    latitude: $latitude
    longitude: $longitude
    pageNo: $pageNo
    pageSize: $pageSize
    query: $query
    range: $range
  ) {
    items {
      address
      city
      country
      name
      pincode
      postal_code
      state
      store_code
      store_email
      uid
      tags
      company_id
      display_name
      store_type
      stage
      default_order_acceptance_timing
      contact_numbers {
        country_code
        number
      }
      contacts {
        country_code
        number
      }
      lat_long {
        coordinates
        type
      }
      order_acceptance_timing {
        open
        closing {
          hour
          minute
        }
        opening {
          hour
          minute
        }
        weekday
      }
    }
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
  }
}`
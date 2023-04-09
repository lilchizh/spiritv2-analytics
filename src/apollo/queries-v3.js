import gql from 'graphql-tag'
import { BUNDLE_ID, FACTORY_ADDRESS_V3 } from '../constants'

const PoolFields = `
  fragment PoolFields on Pool {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity: totalValueLockedUSD
      derivedETH: derivedMatic
    }
    token1 {
      id
      symbol
      name
      totalLiquidity: totalValueLockedUSD
      derivedETH: derivedMatic
    }
    reserve0: totalValueLockedToken0
    reserve1: totalValueLockedToken1
    reserveUSD: totalValueLockedUSD
    trackedReserveETH: totalValueLockedMatic
    reserveETH: totalValueLockedMatic
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
    feeUSD: feesUSD
  }
`

const TokenFieldsV3 = `
  fragment TokenFieldsV3 on Token {
    id
    name
    symbol
    derivedETH: derivedMatic
    tradeVolume: volume
    tradeVolumeUSD: volumeUSD
    untrackedVolumeUSD
    totalLiquidity: totalValueLockedUSD
    txCount
  }
`

export const POOLS_CURRENT = gql`
  query pools {
    pairs: pools(first: 200, orderBy: totalValueLockedMatic, orderDirection: desc) {
      id
    }
  }
`

export const POOLS_BULK = gql`
  ${PoolFields}
  query poolsBulk($allPairs: [Bytes]!) {
    pairs: pools(where: { id_in: $allPairs }, orderBy: totalValueLockedMatic, orderDirection: desc) {
      ...PoolFields
    }
  }
`

export const POOLS_HISTORICAL_BULK = (block, pools) => {
  let poolsString = `[`
  pools.map((pool) => {
    return (poolsString += `"${pool}"`)
  })
  poolsString += ']'
  let queryString = `
    query poolsHistoricalBulk {
      pairs: pools(first: 200, where: {id_in: ${poolsString}}, block: {number: ${block}}, orderBy: totalValueLockedMatic, orderDirection: desc) {
        id
        reserveUSD: totalValueLockedUSD
        trackedReserveETH: totalValueLockedMatic
        volumeUSD
        untrackedVolumeUSD
      }
    }
    `
  return gql(queryString)
}

export const FTM_PRICE_V3 = (block) => {
  const queryString = block
    ? `
      query bundles {
        bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
          id
          ethPrice: maticPriceUSD
        }
      }
    `
    : ` query bundles {
        bundles(where: { id: ${BUNDLE_ID} }) {
          id
          ethPrice: maticPriceUSD
        }
      }
    `
  return gql(queryString)
}

export const GLOBAL_CHART_V3 = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas: algebraDayDatas(
      first: 1000
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      totalVolumeUSD: volumeUSD
      dailyVolumeUSD: volumeUSD
      totalLiquidityUSD: tvlUSD
    }
  }
`
export const GLOBAL_DATA_V3 = (block) => {
  const queryString = ` query uniswapFactory {
        uniswapFactory: factory(
         ${block ? `block: { number: ${block}}` : ``} 
         id: "${FACTORY_ADDRESS_V3}") {
          id
          totalVolumeUSD
          totalVolumeETH: totalVolumeMatic
          totalFeeUSD: totalFeesUSD
          untrackedVolumeUSD
          totalLiquidityUSD: totalValueLockedUSD
          totalLiquidityETH: totalValueLockedMatic
          txCount
          pairCount: poolCount
        }
      }`

  return gql(queryString)
}

export const GLOBAL_TXNS_V3 = gql`
  query transactions {
    transactions(first: 100, orderBy: timestamp, orderDirection: desc) {
      mints(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair: pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        to: owner
        liquidity: amount
        amount0
        amount1
        amountUSD
      }
      burns(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        pair: pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        sender: owner
        liquidity: amount
        amount0
        amount1
        amountUSD
      }
      swaps(orderBy: timestamp, orderDirection: desc) {
        transaction {
          id
          timestamp
        }
        id
        pair: pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        amount0In: amount0
        amount0Out: amount1
        amount1In: amount1
        amount1Out: amount0
        amountUSD
        to: recipient
      }
    }
  }
`

export const TOKEN_CHART_V3 = gql`
  query tokenDayDatas($tokenAddr: String!, $skip: Int!) {
    tokenDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { token: $tokenAddr }) {
      id
      date
      priceUSD
      totalLiquidityToken: totalValueLocked
      totalLiquidityUSD: totalValueLockedUSD
      dailyVolumeToken: volume
      dailyVolumeUSD: volumeUSD
    }
  }
`

export const TOKENS_CURRENT_V3 = gql`
  ${TokenFieldsV3}
  query tokens {
    tokens(first: 200, orderBy: volumeUSD, orderDirection: desc) {
      ...TokenFieldsV3
    }
  }
`

export const TOKENS_DYNAMIC_V3 = (block) => {
  const queryString = `
      ${TokenFieldsV3}
      query tokens {
        tokens(block: {number: ${block}} first: 200, orderBy: volumeUSD, orderDirection: desc) {
          ...TokenFieldsV3
        }
      }
    `
  return gql(queryString)
}

export const TOKEN_DATA_V3 = (tokenAddress, block) => {
  const queryString = `
      ${TokenFieldsV3}
      query tokens {
        tokens(${block ? `block : {number: ${block}}` : ``} where: {id:"${tokenAddress}"}) {
          ...TokenFieldsV3
        }
        pairs0: pools(where: {token0: "${tokenAddress}"}, first: 50, orderBy: totalValueLockedUSD, orderDirection: desc){
          id
        }
        pairs1: pools(where: {token1: "${tokenAddress}"}, first: 50, orderBy: totalValueLockedUSD, orderDirection: desc){
          id
        }
      }
    `
  return gql(queryString)
}

export const FILTERED_TRANSACTIONS_V3 = gql`
  query ($allPairs: [Bytes]!) {
    mints(first: 20, where: { pool_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair: pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to: owner
      liquidity: amount
      amount0
      amount1
      amountUSD
    }
    burns(first: 20, where: { pool_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair: pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender: owner
      liquidity: amount
      amount0
      amount1
      amountUSD
    }
    swaps(first: 30, where: { pool_in: $allPairs }, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      id
      pair: pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In: amount0
      amount0Out: amount1
      amount1In: amount1
      amount1Out: amount0
      amountUSD
      to: recipient
    }
  }
`

export const ALL_POOLS_V3 = gql`
  query pools($skip: Int!) {
    pairs: pools(first: 250, skip: $skip, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`

export const ALL_TOKENS_V3 = gql`
  query tokens($skip: Int!) {
    tokens(first: 100, skip: $skip) {
      id
      name
      symbol
      totalLiquidity: totalValueLockedUSD
    }
  }
`

export const POOL_DATA_V3 = (pairAddress, block) => {
  const queryString = `
      ${PoolFields}
      query pairs {
        pairs: pools(${block ? `block: {number: ${block}}` : ``} where: { id: "${pairAddress}"} ) {
          ...PoolFields
        }
      }`
  return gql(queryString)
}

export const POOL_CHART_V3 = gql`
  query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas: poolDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { pool: $pairAddress }
    ) {
      id
      date
      dailyVolumeToken0: volumeToken0
      dailyVolumeToken1: volumeToken1
      dailyVolumeUSD: volumeUSD
      reserveUSD: tvlUSD
    }
  }
`

export const HOURLY_POOL_RATES_V3 = (pairAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
        t${block.timestamp}: pool(id:"${pairAddress}", block: { number: ${block.number} }) { 
          token0Price
          token1Price
        }
      `
  )

  queryString += '}'
  return gql(queryString)
}

export const PRICES_BY_BLOCK_V3 = (tokenAddress, blocks) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block) => `
        t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
          derivedETH: derivedMatic
        }
      `
  )
  queryString += ','
  queryString += blocks.map(
    (block) => `
        b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
          ethPrice: maticPriceUSD
        }
      `
  )

  queryString += '}'
  return gql(queryString)
}

export const TOKEN_SEARCH_V3 = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(where: { symbol_contains: $value }, orderBy: totalValueLocked, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity: totalValueLocked
    }
    asName: tokens(where: { name_contains: $value }, orderBy: totalValueLocked, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity: totalValueLocked
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalValueLocked, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity: totalValueLocked
    }
  }
`

export const POOL_SEARCH_V3 = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pools(where: { token0_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    as1: pools(where: { token1_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
    asAddress: pools(where: { id: $id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`

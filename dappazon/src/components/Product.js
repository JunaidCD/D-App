import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
// Components
import Rating from './Rating'

import close from '../assets/close.svg'

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null)
  const [hasBought, setHasBought] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const fetchDetails = async () => {
    const events = await dappazon.queryFilter("Buy")
    const orders = events.filter(
      (event) => event.args.buyer === account && event.args.itemId.toString() === item.id.toString()
    )

    if (orders.length === 0) return

    const order = await dappazon.orders(account, orders[0].args.orderId)
    setOrder(order)
  }

  const buyHandler = async () => {
    try {
      setIsLoading(true)
      const signer = await provider.getSigner()

      // Buy item...
      const totalCost = ethers.parseUnits((parseFloat(ethers.formatUnits(item.cost, 'ether')) * quantity).toString(), 'ether')
      let transaction = await dappazon.connect(signer).buy(item.id, { value: totalCost })
      await transaction.wait()

      setHasBought(true)
      setShowSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [hasBought])
  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="Product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>

          <Rating value={item.rating} />

          <hr />

          <p>{item.address}</p>

          <h2>{(parseFloat(ethers.formatUnits(item.cost.toString(), 'ether')) * quantity).toFixed(4)} ETH</h2>

          <hr />

          <h2>Overview</h2>

          <p>
            {item.description}

            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima rem, iusto,
            consectetur inventore quod soluta quos qui assumenda aperiam, eveniet doloribus
            commodi error modi eaque! Iure repudiandae temporibus ex? Optio!
          </p>
        </div>

        <div className="product__order">
          <h1>{(parseFloat(ethers.formatUnits(item.cost.toString(), 'ether')) * quantity).toFixed(4)} ETH</h1>

          <p>
            FREE delivery <br />
            <strong>
              {new Date(Date.now() + 345600000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </strong>
          </p>

          {Number(item.stock) > 0 ? (
            <p>In Stock.</p>
          ) : (
            <p>Out of Stock.</p>
          )}

          <div className="quantity__selector">
            <label>Quantity:</label>
            <div className="quantity__controls">
              <button 
                className="quantity__btn" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity__display">{quantity}</span>
              <button 
                className="quantity__btn" 
                onClick={() => setQuantity(Math.min(Number(item.stock), quantity + 1))}
                disabled={quantity >= Number(item.stock)}
              >
                +
              </button>
            </div>
          </div>

          <button className='product__buy' onClick={buyHandler} disabled={isLoading || Number(item.stock) === 0}>
            {isLoading ? 'Processing...' : 'Buy Now'}
          </button>

          {showSuccess && (
            <div className='product__success'>
              <p style={{color: 'green', fontWeight: 'bold', marginTop: '10px'}}>
                Purchase Successful! Your order has been confirmed.
              </p>
            </div>
          )}

          <p><small>Ships from</small> Dappazon</p>
          <p><small>Sold by</small> Dappazon</p>

          {order && (
            <div className='product__bought'>
              Item bought on <br />
              <strong>
                {new Date(Number(order.time.toString() + '000')).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                  })}
              </strong>
            </div>
          )}
        </div>


        <button onClick={togglePop} className="product__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div >
  );
}

export default Product;
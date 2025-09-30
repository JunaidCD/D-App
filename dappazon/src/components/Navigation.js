import { FaSearch, FaLocationArrow, FaShoppingCart } from 'react-icons/fa';
import { ethers } from 'ethers';

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.getAddress(accounts[0]);
    setAccount(account);
  };

  return (
    <nav>
      {/* First Row: Brand, Location Icon, Search Bar, Cart Icon, Connect Button */}
      <div className="nav__top">
        {/* Brand */}
        <div className="nav__brand">
          <h1>Dappazon</h1>
        </div>

        {/* Location Icon */}
        <FaLocationArrow className="nav__location" />

        {/* Search Bar */}
        <div className="nav__search-container">
          <FaSearch className="search__icon" />
          <input
            type="text"
            className="nav__search"
            placeholder="Search for products"
          />
        </div>

        {/* Cart Icon */}
        <FaShoppingCart className="nav__cart" />

        {/* Connect Button */}
        <div className="nav__connect-container">
          {account ? (
            <button className="nav__connect">
              {account.slice(0, 6) + '...' + account.slice(38, 42)}
            </button>
          ) : (
            <button className="nav__connect" onClick={connectHandler}>
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Links */}
      <ul className="nav__links">
        <li><a href="#Clothing & Jewelry">Clothing & Jewelry</a></li>
        <li><a href="#Electronics & Gadgets">Electronics & Gadgets</a></li>
        <li><a href="#Toys & Gaming">Toys & Gaming</a></li>
      </ul>
    </nav>
  );
};

export default Navigation;
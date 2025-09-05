import React, { useState } from 'react';
import { Mail, Gift, Sparkles } from 'lucide-react';
import styles from './Newsletter.module.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.grid}>
            {/* Content */}
            <div className={styles.content}>
              <div className={styles.badge}>
                <div className={styles.badgeIcon}>
                  <Gift className={styles.badgeIconSvg} />
                </div>
                <span className={styles.badgeText}>Exclusive Offers</span>
              </div>
              
              <h2 className={styles.title}>
                Join Our VIP Club
              </h2>
              <p className={styles.description}>
                Be the first to know about new arrivals, exclusive sales, and luxury collections. 
                Plus, get 15% off your first order when you subscribe!
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={styles.input}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className={styles.submitButton}
                >
                  {isSubscribed ? 'Welcome to VIP Club!' : 'Subscribe & Save 15%'}
                </button>
              </form>

              <div className={styles.disclaimer}>
                <Sparkles className={styles.disclaimerIcon} />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>

            {/* Image */}
            <div className={styles.imageSection}>
              <div className={styles.imageContainer}>
                <img
                  src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Luxury Shopping"
                  className={styles.image}
                />
                <div className={styles.offerBadge}>
                  <span className={styles.offerText}>15% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
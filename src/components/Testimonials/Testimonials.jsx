import React from 'react';
import { Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5,
      text: 'LUXE has completely transformed my shopping experience. The quality of products and customer service is unmatched. Every purchase feels like a luxury experience.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Business Executive',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5,
      text: 'The attention to detail and premium quality of every item I\'ve purchased has exceeded my expectations. LUXE truly understands luxury shopping.'
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Interior Designer',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
      rating: 5,
      text: 'From fashion to home decor, LUXE offers the most exquisite collection. The curation is impeccable and the shopping experience is seamless.'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>What Our Customers Say</h2>
          <p className={styles.description}>
            Discover why thousands of customers trust LUXE for their premium shopping needs
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <Quote className={styles.quoteIcon} />
              
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${styles.star} ${
                      i < testimonial.rating ? styles.filled : styles.empty
                    }`}
                  />
                ))}
              </div>

              <p className={styles.testimonialText}>
                {testimonial.text}
              </p>

              <div className={styles.author}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className={styles.avatar}
                />
                <div className={styles.authorInfo}>
                  <h4 className={styles.authorName}>{testimonial.name}</h4>
                  <p className={styles.authorRole}>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
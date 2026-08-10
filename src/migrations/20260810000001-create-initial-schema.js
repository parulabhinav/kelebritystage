'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. users
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        unique: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'user'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      profile_image: {
        type: Sequelize.STRING(500)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE
      },
      password_hash: {
        type: Sequelize.STRING(255)
      },
      login_method: {
        type: Sequelize.STRING(20),
        defaultValue: 'otp'
      },
      refresh_token: {
        type: Sequelize.STRING(500)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. categories
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT
      },
      icon: {
        type: Sequelize.STRING(100)
      },
      image_url: {
        type: Sequelize.STRING(500)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. commission_settings
    await queryInterface.createTable('commission_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      entity_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID
      },
      platform_fee_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 10.00
      },
      commission_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 15.00
      },
      min_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      max_fee: {
        type: Sequelize.DECIMAL(10, 2)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      release_days: {
        type: Sequelize.INTEGER,
        defaultValue: 14
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 4. verifications
    await queryInterface.createTable('verifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      phone_number: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100)
      },
      otp_code: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      otp_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 5. addresses
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address_line1: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address_line2: {
        type: Sequelize.STRING(255)
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8)
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8)
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      verification_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      verification_documents: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 6. wallets
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      pending_balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total_earned: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'INR'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 7. celebrities
    await queryInterface.createTable('celebrities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bio: {
        type: Sequelize.TEXT
      },
      categories: {
        type: Sequelize.ARRAY(Sequelize.STRING(50)),
        defaultValue: []
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approval_date: {
        type: Sequelize.DATE
      },
      verification_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      total_earnings: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      total_bookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      review_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      video_intro_url: {
        type: Sequelize.STRING(500)
      },
      social_links: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      minimum_price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      maximum_price: {
        type: Sequelize.DECIMAL(10, 2)
      },
      response_time: {
        type: Sequelize.STRING(20)
      },
      portfolio: {
        type: Sequelize.JSONB,
        defaultValue: { images: [], videos: [], documents: [] }
      },
      social_media: {
        type: Sequelize.JSONB,
        defaultValue: {
          instagram: '', twitter: '', youtube: '', facebook: '', tiktok: '', linkedin: '', website: ''
        }
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      experience_years: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      languages_spoken: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      availability_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'available'
      },
      blocked_dates: {
        type: Sequelize.ARRAY(Sequelize.STRING(10)),
        defaultValue: []
      },
      last_profile_update: {
        type: Sequelize.DATE
      },
      profile_completeness: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 8. celebrity_portfolio (SINGULAR tableName per Model inspect)
    await queryInterface.createTable('celebrity_portfolio', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      media_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      media_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      thumbnail_url: {
        type: Sequelize.STRING(500)
      },
      category: {
        type: Sequelize.STRING(50)
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'published'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 9. event_galleries
    await queryInterface.createTable('event_galleries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      event_location: {
        type: Sequelize.STRING(200)
      },
      event_description: {
        type: Sequelize.TEXT
      },
      category: {
        type: Sequelize.STRING(50)
      },
      highlights: {
        type: Sequelize.TEXT
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'published'
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 10. event_gallery_media
    await queryInterface.createTable('event_gallery_media', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      gallery_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'event_galleries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      media_type: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      media_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      thumbnail_url: {
        type: Sequelize.STRING(500)
      },
      media_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      caption: {
        type: Sequelize.TEXT
      },
      is_cover: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      file_size: {
        type: Sequelize.BIGINT
      },
      duration: {
        type: Sequelize.INTEGER
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 11. events (Create booking_id column without FK constraint first to resolve circular dependency)
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      booking_id: {
        type: Sequelize.UUID
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      event_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      event_description: {
        type: Sequelize.TEXT
      },
      event_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      event_end_date: {
        type: Sequelize.DATE
      },
      venue_name: {
        type: Sequelize.STRING(200)
      },
      address_id: {
        type: Sequelize.UUID,
        references: {
          model: 'addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      event_location: {
        type: Sequelize.TEXT
      },
      duration_hours: {
        type: Sequelize.DECIMAL(4, 2)
      },
      expected_audience: {
        type: Sequelize.INTEGER
      },
      special_requirements: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'scheduled'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 12. bookings (FK -> events.id)
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      booking_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_id: {
        type: Sequelize.UUID,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(30),
        defaultValue: 'pending'
      },
      approval_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      approval_deadline: {
        type: Sequelize.DATE
      },
      approved_at: {
        type: Sequelize.DATE
      },
      rejected_at: {
        type: Sequelize.DATE
      },
      rejection_reason: {
        type: Sequelize.TEXT
      },
      event_details: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      appearance_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      commission: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      platform_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      escrow_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      payment_release_date: {
        type: Sequelize.DATE
      },
      payment_held_until: {
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE
      },
      cancelled_at: {
        type: Sequelize.DATE
      },
      cancellation_reason: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 11b. Add events.booking_id FK constraint now that bookings table exists
    await queryInterface.addConstraint('events', {
      fields: ['booking_id'],
      type: 'foreign key',
      name: 'events_booking_id_fkey',
      references: {
        table: 'bookings',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 13. event_testimonials
    await queryInterface.createTable('event_testimonials', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      gallery_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'event_galleries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      event_id: {
        type: Sequelize.UUID,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      testimonial_text: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER
      },
      user_name: {
        type: Sequelize.STRING(100)
      },
      user_image: {
        type: Sequelize.STRING(500)
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 14. payments
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      commission: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      platform_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      escrow_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      net_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        unique: true
      },
      payment_gateway: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      gateway_response: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'pending'
      },
      escrow_release_date: {
        type: Sequelize.DATE
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      refund_reason: {
        type: Sequelize.TEXT
      },
      payment_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      released_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 15. transactions (updatedAt: false)
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      wallet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING(20)
      },
      reference_id: {
        type: Sequelize.UUID
      },
      description: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 16. reviews
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      review: {
        type: Sequelize.TEXT
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 17. disputes
    await queryInterface.createTable('disputes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      celebrity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'celebrities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'open'
      },
      resolution: {
        type: Sequelize.TEXT
      },
      resolved_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      resolved_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 18. notifications
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      read_at: {
        type: Sequelize.DATE
      },
      sent_via: {
        type: Sequelize.ARRAY(Sequelize.STRING(20))
      },
      sent_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 19. device_tokens
    await queryInterface.createTable('device_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      platform: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 20. audit_logs (updatedAt: false)
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID
      },
      changes: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      ip_address: {
        type: Sequelize.STRING(45)
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse dependency order
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('device_tokens');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('disputes');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('event_testimonials');
    
    // Remove FK constraint on events.booking_id before dropping tables
    await queryInterface.removeConstraint('events', 'events_booking_id_fkey').catch(() => {});
    
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('event_gallery_media');
    await queryInterface.dropTable('event_galleries');
    await queryInterface.dropTable('celebrity_portfolio');
    await queryInterface.dropTable('celebrities');
    await queryInterface.dropTable('wallets');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('verifications');
    await queryInterface.dropTable('commission_settings');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  }
};

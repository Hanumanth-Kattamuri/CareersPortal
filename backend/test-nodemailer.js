import React, { useState } from 'react';

export default function GamyamStyledPortal() {
  const [activeTab, setActiveTab] = useState('jobs');

  const colors = {
    darkBg: '#0a0a0a',
    darkCard: '#1a1a1a',
    darkGray: '#2a2a2a',
    orange: '#FF6B35',
    orangeLight: '#FF8C42',
    textLight: '#e0e0e0',
    textMuted: '#b0b0b0',
    textDim: '#888888',
    border: '#333333',
  };

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', color: colors.textLight }}>
      {/* Navigation */}
      <div style={{
        background: colors.darkCard,
        borderBottom: `1px solid ${colors.border}`,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: colors.orange }}>
          gamyam
        </div>
        <button style={{
          background: colors.orange,
          color: colors.darkBg,
          border: 'none',
          padding: '10px 24px',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Contact Us
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '60px', paddingTop: '40px' }}>
          <div style={{
            fontSize: '14px',
            color: colors.orange,
            fontWeight: '600',
            letterSpacing: '2px',
            marginBottom: '16px'
          }}>
            CAREER
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '700', marginBottom: '16px' }}>
            Join Our Team
          </h1>
          <p style={{
            fontSize: '18px',
            color: colors.textMuted,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover a culture that values innovation, collaboration, and personal growth.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: '20px'
        }}>
          {['jobs', 'apply', 'admin'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === tab ? colors.orange : 'transparent',
                color: activeTab === tab ? colors.darkBg : colors.textMuted,
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.3s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Job Cards Tab */}
        {activeTab === 'jobs' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: colors.darkCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = colors.orange;
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(255, 107, 53, 0.2)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Tech Lead</h3>
                  <span style={{
                    background: colors.orange,
                    color: colors.darkBg,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Full-time
                  </span>
                </div>
                
                <p style={{
                  color: colors.orange,
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  Engineering
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>📍 Razole</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>⏰ Full-time</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>💼 Exp: 3-6yrs</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>💰 ₹8-12 LPA</div>
                </div>

                <button style={{
                  width: '100%',
                  background: colors.orange,
                  color: colors.darkBg,
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Application Form Tab */}
        {activeTab === 'apply' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '30px'
          }}>
            {/* Sidebar */}
            <div style={{
              background: colors.darkCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '24px',
              height: 'fit-content',
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{
                background: colors.orange,
                color: colors.darkBg,
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                Now Hiring
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Tech Lead</h3>
              <p style={{ color: colors.orange, fontWeight: '600', marginBottom: '16px' }}>Engineering</p>
              
              <div style={{ height: '1px', background: colors.border, margin: '16px 0' }} />
              
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Position Details
                </h4>
                {[
                  { label: 'Location', value: 'Razole' },
                  { label: 'Experience', value: '3-6 years' },
                  { label: 'Salary', value: '₹8-12 LPA' },
                  { label: 'Type', value: 'Full Time' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: `1px solid ${colors.border}`,
                    fontSize: '13px'
                  }}>
                    <span style={{ color: colors.textDim }}>{item.label}</span>
                    <span style={{ color: colors.textLight, fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Section */}
            <div style={{
              background: colors.darkCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Apply for Position</h2>
              <p style={{ color: colors.textMuted, marginBottom: '32px' }}>
                Upload your resume to auto-fill the form
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Resume Upload */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${colors.orange}`,
                    display: 'inline-block',
                    marginBottom: '20px'
                  }}>
                    📄 Upload Resume
                  </h3>
                  <div style={{
                    border: `2px dashed ${colors.orange}`,
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    background: 'rgba(255, 107, 53, 0.05)',
                    cursor: 'pointer'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📎</div>
                    <div style={{ fontWeight: '600' }}>Click to upload</div>
                    <div style={{ color: colors.textDim, fontSize: '12px', marginTop: '4px' }}>
                      PDF file only (Max 10MB)
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${colors.orange}`,
                    display: 'inline-block',
                    marginBottom: '20px'
                  }}>
                    Personal Information
                  </h3>
                  
                  {[
                    { label: 'Full Name', placeholder: 'Enter your full name' },
                    { label: 'Email', placeholder: 'your.email@example.com' },
                    { label: 'Phone Number', placeholder: 'Enter phone number' }
                  ].map((field, idx) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '6px'
                      }}>
                        {field.label} <span style={{ color: colors.orange }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: colors.textLight,
                          background: colors.darkBg,
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button style={{
                  background: colors.orange,
                  color: colors.darkBg,
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}>
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard Tab */}
        {activeTab === 'admin' && (
          <div style={{
            background: colors.darkCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: colors.darkGray, borderBottom: `1px solid ${colors.border}` }}>
                  {['Name', 'Email', 'Phone', 'Position', 'Status', 'Actions'].map(header => (
                    <th key={header} style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: colors.textLight,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '16px', color: colors.textLight }}>John Doe</td>
                    <td style={{ padding: '16px', color: colors.textMuted }}>john@example.com</td>
                    <td style={{ padding: '16px', color: colors.textMuted }}>+91 9876543210</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: 'rgba(255, 107, 53, 0.2)',
                        color: colors.orange,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Tech Lead
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: 'rgba(76, 175, 80, 0.2)',
                        color: '#4caf50',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Accepted
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button style={{
                        background: colors.orange,
                        color: colors.darkBg,
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
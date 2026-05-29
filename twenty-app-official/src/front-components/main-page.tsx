import { defineFrontComponent } from 'twenty-sdk/define';
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import {
  UGC_BACKEND_URL,
  UGC_INTAKE_API_SECRET,
} from 'src/constants/intake-api';
import {
  APP_DISPLAY_NAME,
  MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type IntakeProduct = { id: string; name: string };
type IntakeCampaign = { id: string; name: string; product_id: string };

type IntakeOptions = {
  products: IntakeProduct[];
  campaigns: IntakeCampaign[];
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  fontSize: '13px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  fontFamily: 'inherit',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#555',
  marginBottom: '4px',
  display: 'block',
};

const fieldStyle: CSSProperties = {
  marginBottom: '12px',
};

function intakeHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (UGC_INTAKE_API_SECRET) {
    headers['X-Intake-Secret'] = UGC_INTAKE_API_SECRET;
  }
  return headers;
}

function formatErrorDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (detail && typeof detail === 'object') {
    const record = detail as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }
    if (typeof record.detail === 'string') {
      return record.detail;
    }
  }
  return 'Request failed';
}

const CreatorIntakeForm = () => {
  const [options, setOptions] = useState<IntakeOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [profileUrl, setProfileUrl] = useState('');
  const [productId, setProductId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [reason, setReason] = useState('');
  const [proposedBy, setProposedBy] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const response = await fetch(`${UGC_BACKEND_URL}/intake/options`, {
          headers: intakeHeaders(),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(formatErrorDetail(body.detail ?? body));
        }
        if (!cancelled) {
          setOptions(body as IntakeOptions);
        }
      } catch (error) {
        if (!cancelled) {
          setOptionsError(
            error instanceof Error ? error.message : 'Could not load products',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const campaignsForProduct = useMemo(() => {
    if (!options || !productId) {
      return [];
    }
    return options.campaigns.filter((c) => c.product_id === productId);
  }, [options, productId]);

  const onProductChange = useCallback((nextProductId: string) => {
    setProductId(nextProductId);
    setCampaignId('');
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${UGC_BACKEND_URL}/intake/creator`, {
        method: 'POST',
        headers: intakeHeaders(),
        body: JSON.stringify({
          profile_url: profileUrl.trim(),
          product_id: productId,
          campaign_id: campaignId,
          reason: reason.trim(),
          proposed_by: proposedBy.trim() || undefined,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = body.detail ?? body;
        throw new Error(formatErrorDetail(detail));
      }

      setSuccessMessage(
        typeof body.message === 'string'
          ? body.message
          : 'Saved for Creator Review. Check the Creator Review board.',
      );
      setProfileUrl('');
      setReason('');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not submit creator',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    profileUrl.trim() &&
    productId &&
    campaignId &&
    reason.trim() &&
    !submitting &&
    !loadingOptions;

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '480px',
        margin: '0 auto',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#333',
          margin: '0 0 4px',
        }}
      >
        Submit creator
      </h1>
      <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px' }}>
        Propose a creator for review. Profile metrics are enriched automatically
        after submit.
      </p>

      {loadingOptions && (
        <p style={{ fontSize: '13px', color: '#888' }}>Loading products…</p>
      )}
      {optionsError && (
        <p
          style={{
            fontSize: '13px',
            color: '#b42318',
            marginBottom: '12px',
          }}
        >
          {optionsError}. Is the backend running at {UGC_BACKEND_URL}?
        </p>
      )}

      {successMessage && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: '#ecfdf3',
            border: '1px solid #abefc6',
            fontSize: '13px',
            color: '#067647',
          }}
        >
          {successMessage}
        </div>
      )}

      {submitError && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: '#fef3f2',
            border: '1px solid #fecdca',
            fontSize: '13px',
            color: '#b42318',
          }}
        >
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="profile-url">
            Profile URL
          </label>
          <input
            id="profile-url"
            type="url"
            required
            placeholder="https://instagram.com/…"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="product">
            Product
          </label>
          <select
            id="product"
            required
            value={productId}
            onChange={(e) => onProductChange(e.target.value)}
            style={inputStyle}
            disabled={!options?.products.length}
          >
            <option value="">Select product</option>
            {(options?.products ?? []).map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="campaign">
            Campaign
          </label>
          <select
            id="campaign"
            required
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            style={inputStyle}
            disabled={!productId || campaignsForProduct.length === 0}
          >
            <option value="">Select campaign</option>
            {campaignsForProduct.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="reason">
            Reason
          </label>
          <textarea
            id="reason"
            required
            rows={3}
            placeholder="Why do you recommend them?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="proposed-by">
            Proposed by (optional)
          </label>
          <input
            id="proposed-by"
            type="text"
            placeholder="Your name"
            value={proposedBy}
            onChange={(e) => setProposedBy(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            color: canSubmit ? '#fff' : '#999',
            background: canSubmit ? '#333' : '#e8e8e8',
            border: 'none',
            borderRadius: '8px',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MAIN_PAGE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: APP_DISPLAY_NAME,
  description: `${APP_DISPLAY_NAME} creator intake form`,
  component: CreatorIntakeForm,
});

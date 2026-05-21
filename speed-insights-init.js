/**
 * Vercel Speed Insights Initialization
 * 
 * This script initializes Vercel Speed Insights for the site.
 * It automatically tracks Core Web Vitals and page performance metrics
 * when deployed to Vercel.
 * 
 * The implementation follows the official @vercel/speed-insights package
 * pattern for vanilla JavaScript/HTML projects.
 * 
 * Learn more: https://vercel.com/docs/speed-insights
 */

(function() {
  'use strict';

  // Initialize the Speed Insights queue
  // This creates a queue for tracking events before the main script loads
  function initQueue() {
    if (window.si) return;
    window.si = function() {
      window.siq = window.siq || [];
      window.siq.push(arguments);
    };
  }

  // Inject the Speed Insights tracking script
  function injectSpeedInsights() {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Initialize the queue first
    initQueue();

    // Determine the correct script source
    // In production on Vercel, this uses the optimized edge script
    var scriptSrc = '/_vercel/speed-insights/script.js';
    
    // Check if script is already loaded to prevent duplicates
    if (document.head.querySelector('script[src*="' + scriptSrc + '"]')) {
      return;
    }

    // Create and configure the script element
    var script = document.createElement('script');
    script.src = scriptSrc;
    script.defer = true;
    
    // Add SDK metadata for tracking
    script.dataset.sdkn = '@vercel/speed-insights';
    script.dataset.sdkv = '2.0.0';

    // Error handling for local development and content blockers
    script.onerror = function() {
      console.log(
        '[Vercel Speed Insights] Failed to load script from ' + scriptSrc + 
        '. This is normal in local development. Speed Insights will work when deployed to Vercel.'
      );
    };

    // Append to head to start tracking
    document.head.appendChild(script);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSpeedInsights);
  } else {
    // DOM is already ready, initialize immediately
    injectSpeedInsights();
  }
})();

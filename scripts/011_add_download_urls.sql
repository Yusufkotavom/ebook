-- Update existing products to include download URLs for testing
UPDATE public.products 
SET download_url = CASE 
  WHEN title = 'The Art of Programming' THEN 'https://example.com/downloads/art-of-programming.pdf'
  WHEN title = 'Digital Marketing Mastery' THEN 'https://example.com/downloads/digital-marketing-mastery.pdf'
  WHEN title = 'Data Science Fundamentals' THEN 'https://example.com/downloads/data-science-fundamentals.pdf'
  WHEN title = 'Web Development Guide' THEN 'https://example.com/downloads/web-development-guide.pdf'
  WHEN title = 'AI and Machine Learning' THEN 'https://example.com/downloads/ai-machine-learning.pdf'
  ELSE download_url
END
WHERE title IN ('The Art of Programming', 'Digital Marketing Mastery', 'Data Science Fundamentals', 'Web Development Guide', 'AI and Machine Learning');

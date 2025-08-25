-- ========================================
-- 10_sample_data.sql
-- Sample Data for Testing (Optional)
-- ========================================

-- Insert sample payment methods
INSERT INTO public.payment_methods (name, type, account_number, account_name, instructions, sort_order, is_active) VALUES
('Bank BCA', 'bank', '1234567890', 'Ebook Store', 'Transfer ke rekening BCA a.n Ebook Store. Mohon kirim bukti transfer setelah pembayaran.', 1, true),
('Bank Mandiri', 'bank', '9876543210', 'Ebook Store', 'Transfer ke rekening Mandiri a.n Ebook Store. Konfirmasi pembayaran via WhatsApp.', 2, true),
('OVO', 'ewallet', '081234567890', 'Ebook Store', 'Kirim ke nomor OVO 081234567890 a.n Ebook Store.', 3, true),
('DANA', 'ewallet', '081234567890', 'Ebook Store', 'Transfer DANA ke nomor 081234567890 a.n Ebook Store.', 4, true),
('GoPay', 'ewallet', '081234567890', 'Ebook Store', 'Bayar dengan GoPay ke nomor 081234567890.', 5, true)
ON CONFLICT DO NOTHING;

-- Insert sample products (10 ebooks)
INSERT INTO public.products (title, author, publisher, year, price, description, category, tags, isbn, page_count, file_size_mb, is_active) VALUES
('Belajar JavaScript Modern', 'Ahmad Santoso', 'TechPublisher', 2023, 150000.00, 
'Panduan lengkap belajar JavaScript ES6+ dengan contoh praktis dan project nyata. Cocok untuk pemula hingga intermediate.', 
'Technology', ARRAY['javascript', 'programming', 'web'], '978-1234567890', 350, 15.5, true),

('Digital Marketing Strategy', 'Sari Wijaya', 'BusinessBooks', 2023, 200000.00, 
'Strategi pemasaran digital yang terbukti efektif untuk meningkatkan penjualan online di era digital.', 
'Business', ARRAY['marketing', 'digital', 'strategy'], '978-2345678901', 280, 12.3, true),

('Python untuk Data Science', 'Budi Kurniawan', 'DataPress', 2023, 175000.00, 
'Pelajari Python untuk analisis data, machine learning, dan visualisasi data dengan library populer seperti Pandas dan NumPy.', 
'Technology', ARRAY['python', 'data science', 'machine learning'], '978-3456789012', 420, 18.7, true),

('Manajemen Keuangan Personal', 'Lisa Handayani', 'FinanceBooks', 2022, 125000.00, 
'Panduan praktis mengelola keuangan pribadi, investasi, dan perencanaan masa depan untuk mencapai kebebasan finansial.', 
'Finance', ARRAY['finance', 'investment', 'personal'], '978-4567890123', 245, 8.9, true),

('Desain UI/UX Modern', 'Eko Prasetyo', 'DesignStudio', 2023, 180000.00, 
'Prinsip dan praktik desain UI/UX modern dengan tools seperti Figma dan Adobe XD. Dilengkapi studi kasus nyata.', 
'Design', ARRAY['ui', 'ux', 'design', 'figma'], '978-5678901234', 320, 25.4, true),

('Machine Learning Practical', 'Dr. Andi Wijaya', 'AIPublishing', 2023, 220000.00, 
'Implementasi machine learning dengan Python dan TensorFlow. Dari teori dasar hingga deployment model.', 
'Technology', ARRAY['machine learning', 'ai', 'tensorflow'], '978-6789012345', 480, 22.1, true),

('Copywriting yang Menjual', 'Maya Sari', 'MarketingPro', 2022, 145000.00, 
'Teknik copywriting yang terbukti meningkatkan konversi penjualan. Cocok untuk pemilik bisnis dan marketer.', 
'Business', ARRAY['copywriting', 'sales', 'marketing'], '978-7890123456', 210, 7.6, true),

('React JS Complete Guide', 'Rizki Maulana', 'WebDev Press', 2023, 190000.00, 
'Panduan lengkap React JS dari dasar hingga advanced. Termasuk Redux, React Router, dan deployment.', 
'Technology', ARRAY['react', 'javascript', 'web development'], '978-8901234567', 380, 16.8, true),

('Strategi Investasi Saham', 'Doni Prakasa', 'InvestBooks', 2023, 165000.00, 
'Strategi investasi saham untuk pemula dan intermediate. Analisis fundamental dan teknikal dijelaskan lengkap.', 
'Finance', ARRAY['investment', 'stocks', 'finance'], '978-9012345678', 290, 11.2, true),

('Entrepreneurship 101', 'Fitri Nurmalasari', 'BusinessHub', 2022, 135000.00, 
'Panduan memulai bisnis dari nol hingga sukses. Termasuk business plan, marketing strategy, dan manajemen.', 
'Business', ARRAY['entrepreneurship', 'startup', 'business'], '978-0123456789', 260, 9.8, true)
ON CONFLICT DO NOTHING;

-- Note: No sample orders or users are created for security reasons
-- Admin users should be added manually after setup

-- Update dashboard stats materialized view
SELECT public.refresh_dashboard_stats();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Step 10 Complete: Sample data inserted successfully';
  RAISE NOTICE '📚 10 sample ebooks added to catalog';
  RAISE NOTICE '💳 5 payment methods added (Bank BCA, Mandiri, OVO, DANA, GoPay)';
  RAISE NOTICE '📊 Dashboard statistics refreshed';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
  RAISE NOTICE '👤 Remember to add your first admin user!';
  RAISE NOTICE '🔧 Update your .env.local with new Supabase credentials';
END $$;
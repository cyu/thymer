Dir.glob('*') do |f|
  unless %w(README.markdown thymer.appcache Rakefile).include?(File.basename(f))
    file 'thymer.appcache' => f
  end
end

file 'thymer.appcache' do |t|
  revision = 1

  if File.exists?(t.name)
    manifest = File.read(t.name)
    revision = manifest.lines.to_a[1].split(/:/).last.strip.to_i + 1
  end

  puts "Writing #{t.name}..."
  File.open(t.name, 'w') do |f|
    f.puts('CACHE MANIFEST')
    f.puts("# Revision: #{revision}")
    t.prerequisites.each { |p| f.puts(p) }
  end
end

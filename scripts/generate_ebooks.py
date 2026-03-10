import os

path = os.path.join('frontend', 'static', 'ebooks')
os.makedirs(path, exist_ok=True)

books = {
    'python': 'Python Programming',
    'javascript': 'JavaScript Mastery',
    'algorithms': 'Data Structures',
    'machine-learning': 'Machine Learning'
}


def make_pdf(title, filename):
    # Minimal PDF with single line of text
    header = '%PDF-1.4\n'
    objs = []
    objs.append('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
    objs.append('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
    objs.append(
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n'
    )
    objs.append('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')
    text = f"{title} - Sample ebook content for download and reading."
    esc = text.replace('(', '\\(').replace(')', '\\)')
    stream = f"BT\n/F1 18 Tf\n40 740 Td\n({esc}) Tj\nET\n"
    objs.append(f"5 0 obj\n<< /Length {len(stream)} >>\nstream\n{stream}\nendstream\nendobj\n")

    out = header
    positions = []
    pos = len(out.encode('latin1'))
    for obj in objs:
        positions.append(pos)
        out += obj
        pos = len(out.encode('latin1'))

    xref = f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n"
    for p in positions:
        xref += f"{p:010d} 00000 n \n"
    trailer = f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{len(out.encode('latin1'))}\n%%EOF\n"
    out += xref + trailer

    with open(os.path.join(path, filename), 'wb') as f:
        f.write(out.encode('latin1'))

    print('Created', filename)


if __name__ == '__main__':
    for key, title in books.items():
        make_pdf(title, f"{key}.pdf")

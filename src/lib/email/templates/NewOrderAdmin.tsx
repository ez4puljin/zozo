import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Button,
  Img,
  Link,
} from "@react-email/components";

interface OrderItemRow {
  name: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPriceMnt: number;
  quantity: number;
  unitsPerBundle: number;
  lineTotalMnt: number;
}

interface Props {
  orderNumber: string;
  orderId: string;
  createdAtText: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    additionalPhone?: string;
    district: string;
    khoroo?: string;
    building?: string;
    entrance?: string;
    floor?: string;
    apartment?: string;
    notes?: string;
  };
  items: OrderItemRow[];
  subtotalMnt: number;
  shippingMnt: number;
  discountMnt: number;
  totalMnt: number;
  adminUrl: string;
  shopName: string;
}

const fmt = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + " ₮";

export function NewOrderAdmin(props: Props) {
  const {
    orderNumber,
    createdAtText,
    customer,
    items,
    subtotalMnt,
    shippingMnt,
    discountMnt,
    totalMnt,
    adminUrl,
    shopName,
  } = props;

  return (
    <Html lang="mn">
      <Head />
      <Preview>{`Шинэ захиалга #${orderNumber} · ${fmt(totalMnt)}`}</Preview>
      <Body style={{ background: "#f6f6f6", fontFamily: "system-ui, sans-serif" }}>
        <Container
          style={{
            background: "#fff",
            padding: 24,
            maxWidth: 600,
            margin: "16px auto",
            borderRadius: 8,
          }}
        >
          <Heading as="h2" style={{ margin: "0 0 4px", fontSize: 20 }}>
            🔔 Шинэ захиалга
          </Heading>
          <Text style={{ margin: 0, color: "#666", fontSize: 14 }}>
            {shopName} · {createdAtText}
          </Text>

          <Section style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, marginTop: 16 }}>
            <Text style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
              #{orderNumber}
            </Text>
            <Text style={{ margin: "4px 0 0", fontSize: 14 }}>
              Нийт дүн: <b>{fmt(totalMnt)}</b>
            </Text>
          </Section>

          <Hr style={{ margin: "24px 0" }} />

          <Heading as="h3" style={{ fontSize: 16, margin: "0 0 8px" }}>
            Хэрэглэгч
          </Heading>
          <Text style={{ margin: "0 0 4px", fontSize: 14 }}>
            <b>
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ")}
            </b>
          </Text>
          <Text style={{ margin: "0 0 4px", fontSize: 14 }}>
            Утас:{" "}
            <Link href={`tel:${customer.phone}`} style={{ color: "#0a0a0a", fontWeight: 600 }}>
              {customer.phone}
            </Link>
            {customer.additionalPhone ? ` · Нэмэлт: ${customer.additionalPhone}` : ""}
          </Text>

          <Heading as="h3" style={{ fontSize: 16, margin: "16px 0 8px" }}>
            Хүргэлтийн хаяг
          </Heading>
          <Text style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            {customer.district}
            {customer.khoroo ? ` · ${customer.khoroo}` : ""}
            <br />
            {[customer.building, customer.entrance, customer.floor, customer.apartment]
              .filter(Boolean)
              .join(", ")}
            {customer.notes ? (
              <>
                <br />
                <i style={{ color: "#666" }}>Тэмдэглэл: {customer.notes}</i>
              </>
            ) : null}
          </Text>

          <Hr style={{ margin: "24px 0" }} />

          <Heading as="h3" style={{ fontSize: 16, margin: "0 0 8px" }}>
            Захиалга
          </Heading>
          {items.map((it, i) => (
            <Row key={i} style={{ marginBottom: 12 }}>
              {it.imageUrl ? (
                <Column style={{ width: 64, paddingRight: 12 }}>
                  <Img
                    src={it.imageUrl}
                    alt={it.name}
                    width="56"
                    height="56"
                    style={{ borderRadius: 6, objectFit: "cover" }}
                  />
                </Column>
              ) : null}
              <Column>
                <Text style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{it.name}</Text>
                <Text style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>
                  {it.variantLabel} × {it.quantity}
                  {it.unitsPerBundle > 1 ? ` (${it.quantity * it.unitsPerBundle} ширхэг)` : ""}
                </Text>
              </Column>
              <Column style={{ textAlign: "right", width: 100 }}>
                <Text style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  {fmt(it.lineTotalMnt)}
                </Text>
              </Column>
            </Row>
          ))}

          <Hr style={{ margin: "16px 0" }} />

          <Row>
            <Column>
              <Text style={{ margin: "4px 0", fontSize: 14, color: "#666" }}>
                Дэд дүн
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ margin: "4px 0", fontSize: 14 }}>{fmt(subtotalMnt)}</Text>
            </Column>
          </Row>
          {discountMnt > 0 ? (
            <Row>
              <Column>
                <Text style={{ margin: "4px 0", fontSize: 14, color: "#16a34a" }}>
                  Хэмнэлт
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ margin: "4px 0", fontSize: 14, color: "#16a34a" }}>
                  -{fmt(discountMnt)}
                </Text>
              </Column>
            </Row>
          ) : null}
          <Row>
            <Column>
              <Text style={{ margin: "4px 0", fontSize: 14, color: "#666" }}>
                Хүргэлт
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ margin: "4px 0", fontSize: 14 }}>
                {shippingMnt > 0 ? fmt(shippingMnt) : "Үнэгүй"}
              </Text>
            </Column>
          </Row>
          <Row style={{ marginTop: 8 }}>
            <Column>
              <Text style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Нийт</Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {fmt(totalMnt)}
              </Text>
            </Column>
          </Row>

          <Text style={{ margin: "16px 0 0", fontSize: 13, color: "#666" }}>
            Төлбөр: АВАХДАА ТӨЛӨХ
          </Text>

          <Section style={{ textAlign: "center", marginTop: 24 }}>
            <Button
              href={adminUrl}
              style={{
                background: "#0a0a0a",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Захиалгыг нээх
            </Button>
          </Section>

          <Hr style={{ margin: "24px 0" }} />
          <Text style={{ margin: 0, fontSize: 12, color: "#999", textAlign: "center" }}>
            Энэ имэйл {shopName} дэлгүүрээс ирлээ.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NewOrderAdmin;

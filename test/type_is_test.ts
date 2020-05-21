import {
  assertStrictEq,
} from "https://deno.land/std/testing/asserts.ts";
import { is, typeofrequest, hasBody } from "../mod.ts";

const { test } = Deno;

test("typeofrequest(header, types) should ignore params", function () {
  const header = createHeader("text/html; charset=utf-8");
  assertStrictEq(typeofrequest(header, ["text/*"]), "text/html");
});

test("typeofrequest(header, types) should ignore params LWS", function () {
  const header = createHeader("text/html ; charset=utf-8");
  assertStrictEq(typeofrequest(header, ["text/*"]), "text/html");
});

test("typeofrequest(header, types) should ignore casing", function () {
  const header = createHeader("text/HTML");
  assertStrictEq(typeofrequest(header, ["text/*"]), "text/html");
});

test("typeofrequest(header, types) should fail invalid type", function () {
  const header = createHeader("text/html**");
  assertStrictEq(typeofrequest(header, ["text/*"]), false);
});

test("typeofrequest(header, types) should not match invalid type", function () {
  const header = createHeader("text/html");
  assertStrictEq(typeofrequest(header, ["text/html/"]), false);
});

test("typeofrequest(header, types) when no body is given should return null", function () {
  const header = new Headers();

  assertStrictEq(typeofrequest(header), null);
  assertStrictEq(typeofrequest(header, ["image/*"]), null);
  assertStrictEq(typeofrequest(header, ["image/*", "text/*"]), null);
});

test("typeofrequest(header, types) when no content type is given should return false", function () {
  const header = createHeader();
  assertStrictEq(typeofrequest(header), false);
  assertStrictEq(typeofrequest(header, ["image/*"]), false);
  assertStrictEq(typeofrequest(header, ["text/*", "image/*"]), false);
});

test("typeofrequest(header, types) give no types should return the mime type", function () {
  const header = createHeader("image/png");
  assertStrictEq(typeofrequest(header), "image/png");
});

test("typeofrequest(header, types) given one type should return the type or false", function () {
  const header = createHeader("image/png");

  assertStrictEq(typeofrequest(header, ["png"]), "png");
  assertStrictEq(typeofrequest(header, [".png"]), ".png");
  assertStrictEq(typeofrequest(header, ["image/png"]), "image/png");
  assertStrictEq(typeofrequest(header, ["image/*"]), "image/png");
  assertStrictEq(typeofrequest(header, ["*/png"]), "image/png");

  assertStrictEq(typeofrequest(header, ["jpeg"]), false);
  assertStrictEq(typeofrequest(header, [".jpeg"]), false);
  assertStrictEq(typeofrequest(header, ["image/jpeg"]), false);
  assertStrictEq(typeofrequest(header, ["text/*"]), false);
  assertStrictEq(typeofrequest(header, ["*/jpeg"]), false);

  assertStrictEq(typeofrequest(header, ["bogus"]), false);
  assertStrictEq(typeofrequest(header, ["something/bogus*"]), false);
});

test("typeofrequest(header, types) given multiple types should return the first match or false", function () {
  const header = createHeader("image/png");

  assertStrictEq(typeofrequest(header, ["png"]), "png");
  assertStrictEq(typeofrequest(header, [".png"]), ".png");
  assertStrictEq(typeofrequest(header, ["text/*", "image/*"]), "image/png");
  assertStrictEq(typeofrequest(header, ["image/*", "text/*"]), "image/png");
  assertStrictEq(typeofrequest(header, ["image/*", "image/png"]), "image/png");
  assertStrictEq(typeofrequest(header, ["image/png", "image/*"]), "image/png");

  assertStrictEq(typeofrequest(header, ["jpeg"]), false);
  assertStrictEq(typeofrequest(header, [".jpeg"]), false);
  assertStrictEq(typeofrequest(header, ["text/*", "application/*"]), false);
  assertStrictEq(
    typeofrequest(header, ["text/html", "text/plain", "application/json"]),
    false,
  );
});

test("typeofrequest(header, types) given +suffix should match suffix types", function () {
  const header = createHeader("application/vnd+json");

  assertStrictEq(typeofrequest(header, ["+json"]), "application/vnd+json");
  assertStrictEq(
    typeofrequest(header, ["application/vnd+json"]),
    "application/vnd+json",
  );
  assertStrictEq(
    typeofrequest(header, ["application/*+json"]),
    "application/vnd+json",
  );
  assertStrictEq(typeofrequest(header, ["*/vnd+json"]), "application/vnd+json");
  assertStrictEq(typeofrequest(header, ["application/json"]), false);
  assertStrictEq(typeofrequest(header, ["text/*+json"]), false);
});

test('typeofrequest(header, types) given "*/*" should match any content-type', function () {
  assertStrictEq(
    typeofrequest(createHeader("text/html"), ["*/*"]),
    "text/html",
  );
  assertStrictEq(typeofrequest(createHeader("text/xml"), ["*/*"]), "text/xml");
  assertStrictEq(
    typeofrequest(createHeader("application/json"), ["*/*"]),
    "application/json",
  );
  assertStrictEq(
    typeofrequest(createHeader("application/vnd+json"), ["*/*"]),
    "application/vnd+json",
  );
});

test('typeofrequest(header, types) given "*/*" should not match invalid content-type', function () {
  assertStrictEq(typeofrequest(createHeader("bogus"), ["*/*"]), false);
});

test('typeofrequest(header, types) given "*/*" should not match body-less request', function () {
  const header = new Headers([["content-type", "text/html"]]);
  assertStrictEq(typeofrequest(header, ["*/*"]), null);
});

test('should match "urlencoded"', function () {
  const header = createHeader("application/x-www-form-urlencoded");

  assertStrictEq(typeofrequest(header, ["urlencoded"]), "urlencoded");
  assertStrictEq(typeofrequest(header, ["json", "urlencoded"]), "urlencoded");
  assertStrictEq(typeofrequest(header, ["urlencoded", "json"]), "urlencoded");
});

test('typeofrequest(header, types) when Content-Type: multipart/form-data should match "multipart/*"', function () {
  const header = createHeader("multipart/form-data");

  assertStrictEq(typeofrequest(header, ["multipart/*"]), "multipart/form-data");
});

test('typeofrequest(header, types) when Content-Type: multipart/form-data should match "multipart"', function () {
  const header = createHeader("multipart/form-data");

  assertStrictEq(typeofrequest(header, ["multipart"]), "multipart");
});

test("hasBody(req) content-length should indicate body", function () {
  const header = new Headers([["content-length", "1"]]);
  assertStrictEq(hasBody(header), true);
});

test("hasBody(req) content-length should be true when 0", function () {
  const header = new Headers([["content-length", "0"]]);
  assertStrictEq(hasBody(header), true);
});

test("hasBody(req) content-length should be false when bogus", function () {
  const header = new Headers([["content-length", "bogus"]]);
  assertStrictEq(hasBody(header), false);
});

test("hasBody(req) transfer-encoding should indicate body", function () {
  const header = new Headers([["transfer-encoding", "1"]]);
  assertStrictEq(hasBody(header), true);
});

test("is(mediaType, types) should ignore params", function () {
  assertStrictEq(is("text/html; charset=utf-8", ["text/*"]), "text/html");
});

test("is(mediaType, types) should ignore casing", function () {
  assertStrictEq(is("text/HTML", ["text/*"]), "text/html");
});

test("is(mediaType, types) should fail invalid type", function () {
  assertStrictEq(is("text/html**", ["text/*"]), false);
});

test("is(mediaType, types) given no types should return the mime type", function () {
  assertStrictEq(is("image/png"), "image/png");
});

test("is(mediaType, types) given one type should return the type or false", function () {
  assertStrictEq(is("image/png", ["png"]), "png");
  assertStrictEq(is("image/png", [".png"]), ".png");
  assertStrictEq(is("image/png", ["image/png"]), "image/png");
  assertStrictEq(is("image/png", ["image/*"]), "image/png");
  assertStrictEq(is("image/png", ["*/png"]), "image/png");

  assertStrictEq(is("image/png", ["jpeg"]), false);
  assertStrictEq(is("image/png", [".jpeg"]), false);
  assertStrictEq(is("image/png", ["image/jpeg"]), false);
  assertStrictEq(is("image/png", ["text/*"]), false);
  assertStrictEq(is("image/png", ["*/jpeg"]), false);

  assertStrictEq(is("image/png", ["bogus"]), false);
  assertStrictEq(is("image/png", ["something/bogus*"]), false);
});

test("is(mediaType, types) given multiple types should return the first match or false", function () {
  assertStrictEq(is("image/png", ["png"]), "png");
  assertStrictEq(is("image/png", [".png"]), ".png");
  assertStrictEq(is("image/png", ["text/*", "image/*"]), "image/png");
  assertStrictEq(is("image/png", ["image/*", "text/*"]), "image/png");
  assertStrictEq(is("image/png", ["image/*", "image/png"]), "image/png");
  assertStrictEq(is("image/png", ["image/png", "image/*"]), "image/png");

  assertStrictEq(is("image/png", ["jpeg"]), false);
  assertStrictEq(is("image/png", [".jpeg"]), false);
  assertStrictEq(is("image/png", ["text/*", "application/*"]), false);
  assertStrictEq(
    is("image/png", ["text/html", "text/plain", "application/json"]),
    false,
  );
});

test("is(mediaType, types) given +suffix should match suffix types", function () {
  assertStrictEq(is("application/vnd+json", ["+json"]), "application/vnd+json");
  assertStrictEq(
    is("application/vnd+json", ["application/vnd+json"]),
    "application/vnd+json",
  );
  assertStrictEq(
    is("application/vnd+json", ["application/*+json"]),
    "application/vnd+json",
  );
  assertStrictEq(
    is("application/vnd+json", ["*/vnd+json"]),
    "application/vnd+json",
  );
  assertStrictEq(is("application/vnd+json", ["application/json"]), false);
  assertStrictEq(is("application/vnd+json", ["text/*+json"]), false);
});

test('is(mediaType, types) given "*/*" should match any media type', function () {
  assertStrictEq(is("text/html", ["*/*"]), "text/html");
  assertStrictEq(is("text/xml", ["*/*"]), "text/xml");
  assertStrictEq(is("application/json", ["*/*"]), "application/json");
  assertStrictEq(is("application/vnd+json", ["*/*"]), "application/vnd+json");
});

test('is(mediaType, types) given "*/*" should not match invalid media type', function () {
  assertStrictEq(is("bogus", ["*/*"]), false);
});

test('is(mediaType, types) when media type is application/x-www-form-urlencoded should match "urlencoded"', function () {
  assertStrictEq(
    is("application/x-www-form-urlencoded", ["urlencoded"]),
    "urlencoded",
  );
  assertStrictEq(
    is("application/x-www-form-urlencoded", ["json", "urlencoded"]),
    "urlencoded",
  );
  assertStrictEq(
    is("application/x-www-form-urlencoded", ["urlencoded", "json"]),
    "urlencoded",
  );
});

test('is(mediaType, types) when media type is multipart/form-data should match "multipart/*"', function () {
  assertStrictEq(
    is("multipart/form-data", ["multipart/*"]),
    "multipart/form-data",
  );
});

test('is(mediaType, types) when media type is multipart/form-data should match "multipart"', function () {
  assertStrictEq(is("multipart/form-data", ["multipart"]), "multipart");
});

function createHeader(type?: string): Headers {
  const header = new Headers([
    ["transfer-encoding", "chunked"],
  ]);
  if (type) {
    header.set("content-type", type);
  }
  return header;
}
